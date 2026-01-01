// Shared types for multi-channel messaging (IVR, SMS, Social)

export type ChannelType = 'web' | 'ivr' | 'sms' | 'facebook' | 'instagram' | 'whatsapp';

export interface ChannelMessage {
  channel: ChannelType;
  sessionId: string;
  userId: string;  // Phone number, user ID, etc.
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChannelResponse {
  message: string;
  language: 'en' | 'es';
  sentiment: string;
  sources: Array<{ title: string; url: string }>;
  escalate: boolean;
  conversationId: string;
}

export interface ChannelSession {
  sessionId: string;
  channel: ChannelType;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  language: 'en' | 'es';
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
}

// Session timeout: 24 hours for SMS/social, 5 minutes for IVR
export const SESSION_TIMEOUTS: Record<ChannelType, number> = {
  web: 30 * 60 * 1000,      // 30 minutes
  ivr: 5 * 60 * 1000,       // 5 minutes
  sms: 24 * 60 * 60 * 1000, // 24 hours
  facebook: 24 * 60 * 60 * 1000,
  instagram: 24 * 60 * 60 * 1000,
  whatsapp: 24 * 60 * 60 * 1000,
};
