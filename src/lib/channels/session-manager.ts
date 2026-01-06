// Session manager for multi-channel conversations (IVR, SMS, Social)
import { promises as fs } from 'fs';
import path from 'path';
import { ChannelSession, ChannelType, SESSION_TIMEOUTS } from './types';
import { Language } from '../i18n';

// Use /tmp on Vercel (writable), fallback to data/ locally
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'channel-sessions.json');

interface SessionStore {
  sessions: Record<string, ChannelSession>;
  lastUpdated: string;
}

// In-memory fallback for serverless environments
let memoryStore: SessionStore = { sessions: {}, lastUpdated: new Date().toISOString() };

async function loadSessions(): Promise<SessionStore> {
  try {
    const content = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Return in-memory store on Vercel, empty store locally
    return isVercel ? memoryStore : { sessions: {}, lastUpdated: new Date().toISOString() };
  }
}

async function saveSessions(store: SessionStore): Promise<void> {
  store.lastUpdated = new Date().toISOString();
  if (isVercel) {
    // Update in-memory store and try to write to /tmp
    memoryStore = store;
    try {
      await fs.writeFile(SESSIONS_FILE, JSON.stringify(store, null, 2));
    } catch {
      // Ignore write errors on Vercel, use in-memory
    }
  } else {
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(store, null, 2));
  }
}

function generateSessionKey(channel: ChannelType, userId: string): string {
  return `${channel}:${userId}`;
}

export async function getOrCreateSession(
  channel: ChannelType,
  userId: string,
  language: Language = 'en'
): Promise<ChannelSession> {
  const store = await loadSessions();
  const key = generateSessionKey(channel, userId);
  const existing = store.sessions[key];

  // Check if session exists and is not expired
  if (existing) {
    const timeout = SESSION_TIMEOUTS[channel];
    const lastActivity = new Date(existing.lastActivity).getTime();
    const now = Date.now();

    if (now - lastActivity < timeout) {
      // Session is still valid, update last activity
      existing.lastActivity = new Date();
      await saveSessions(store);
      return {
        ...existing,
        startTime: new Date(existing.startTime),
        lastActivity: new Date(existing.lastActivity),
        messages: existing.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      };
    }
  }

  // Create new session
  const session: ChannelSession = {
    sessionId: `${channel}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channel,
    userId,
    startTime: new Date(),
    lastActivity: new Date(),
    language,
    messages: [],
  };

  store.sessions[key] = session;
  await saveSessions(store);

  return session;
}

export async function addMessageToSession(
  channel: ChannelType,
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const store = await loadSessions();
  const key = generateSessionKey(channel, userId);
  const session = store.sessions[key];

  if (session) {
    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    session.lastActivity = new Date();
    await saveSessions(store);
  }
}

export async function updateSessionLanguage(
  channel: ChannelType,
  userId: string,
  language: Language
): Promise<void> {
  const store = await loadSessions();
  const key = generateSessionKey(channel, userId);
  const session = store.sessions[key];

  if (session) {
    session.language = language;
    await saveSessions(store);
  }
}

export async function clearSession(
  channel: ChannelType,
  userId: string
): Promise<void> {
  const store = await loadSessions();
  const key = generateSessionKey(channel, userId);
  delete store.sessions[key];
  await saveSessions(store);
}

export async function getSessionHistory(
  channel: ChannelType,
  userId: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const session = await getOrCreateSession(channel, userId);
  return session.messages.map(m => ({ role: m.role, content: m.content }));
}

// Cross-channel session continuity (ITN 3.2.6 IVR Integration)
// Allows seamless conversation handoff between channels (e.g., IVR to web)

export interface CrossChannelToken {
  token: string;
  sourceChannel: ChannelType;
  sourceUserId: string;
  sessionId: string;
  language: Language;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const CROSS_CHANNEL_TOKENS_FILE = path.join(DATA_DIR, 'cross-channel-tokens.json');

// In-memory fallback for cross-channel tokens
let memoryTokens: Record<string, CrossChannelToken> = {};

async function loadCrossChannelTokens(): Promise<Record<string, CrossChannelToken>> {
  try {
    const content = await fs.readFile(CROSS_CHANNEL_TOKENS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return isVercel ? memoryTokens : {};
  }
}

async function saveCrossChannelTokens(tokens: Record<string, CrossChannelToken>): Promise<void> {
  if (isVercel) {
    memoryTokens = tokens;
    try {
      await fs.writeFile(CROSS_CHANNEL_TOKENS_FILE, JSON.stringify(tokens, null, 2));
    } catch {
      // Ignore write errors on Vercel
    }
  } else {
    await fs.writeFile(CROSS_CHANNEL_TOKENS_FILE, JSON.stringify(tokens, null, 2));
  }
}

// Generate a token for cross-channel session handoff
// Use case: User on IVR wants to continue conversation on web
export async function generateCrossChannelToken(
  sourceChannel: ChannelType,
  sourceUserId: string
): Promise<string> {
  const store = await loadSessions();
  const key = generateSessionKey(sourceChannel, sourceUserId);
  const session = store.sessions[key];

  if (!session) {
    throw new Error('No active session found for user');
  }

  // Generate a short, easy-to-read token (for phone/IVR)
  const token = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const tokens = await loadCrossChannelTokens();
  tokens[token] = {
    token,
    sourceChannel,
    sourceUserId,
    sessionId: session.sessionId,
    language: session.language,
    createdAt: new Date(),
    expiresAt,
    used: false,
  };

  await saveCrossChannelTokens(tokens);

  return token;
}

// Redeem a cross-channel token to transfer session to new channel
export async function redeemCrossChannelToken(
  token: string,
  targetChannel: ChannelType,
  targetUserId: string
): Promise<ChannelSession | null> {
  const tokens = await loadCrossChannelTokens();
  const tokenData = tokens[token.toUpperCase()];

  if (!tokenData) {
    return null; // Token not found
  }

  if (tokenData.used) {
    return null; // Token already used
  }

  if (new Date(tokenData.expiresAt) < new Date()) {
    return null; // Token expired
  }

  // Load original session
  const store = await loadSessions();
  const sourceKey = generateSessionKey(tokenData.sourceChannel, tokenData.sourceUserId);
  const sourceSession = store.sessions[sourceKey];

  if (!sourceSession) {
    return null; // Source session no longer exists
  }

  // Create new session on target channel with transferred history
  const targetKey = generateSessionKey(targetChannel, targetUserId);
  const newSession: ChannelSession = {
    sessionId: `${targetChannel}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channel: targetChannel,
    userId: targetUserId,
    startTime: new Date(),
    lastActivity: new Date(),
    language: sourceSession.language,
    messages: sourceSession.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
    linkedSessionId: sourceSession.sessionId, // Track the link
  };

  store.sessions[targetKey] = newSession;
  await saveSessions(store);

  // Mark token as used
  tokenData.used = true;
  await saveCrossChannelTokens(tokens);

  return newSession;
}

// Get session by session ID (for looking up linked sessions)
export async function getSessionById(sessionId: string): Promise<ChannelSession | null> {
  const store = await loadSessions();

  for (const session of Object.values(store.sessions)) {
    if (session.sessionId === sessionId) {
      return {
        ...session,
        startTime: new Date(session.startTime),
        lastActivity: new Date(session.lastActivity),
        messages: session.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      };
    }
  }

  return null;
}
