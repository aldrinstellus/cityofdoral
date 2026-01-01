// Session manager for multi-channel conversations (IVR, SMS, Social)
import { promises as fs } from 'fs';
import path from 'path';
import { ChannelSession, ChannelType, SESSION_TIMEOUTS } from './types';

const SESSIONS_FILE = path.join(process.cwd(), 'data', 'channel-sessions.json');

interface SessionStore {
  sessions: Record<string, ChannelSession>;
  lastUpdated: string;
}

async function loadSessions(): Promise<SessionStore> {
  try {
    const content = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { sessions: {}, lastUpdated: new Date().toISOString() };
  }
}

async function saveSessions(store: SessionStore): Promise<void> {
  store.lastUpdated = new Date().toISOString();
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(store, null, 2));
}

function generateSessionKey(channel: ChannelType, userId: string): string {
  return `${channel}:${userId}`;
}

export async function getOrCreateSession(
  channel: ChannelType,
  userId: string,
  language: 'en' | 'es' = 'en'
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
  language: 'en' | 'es'
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
