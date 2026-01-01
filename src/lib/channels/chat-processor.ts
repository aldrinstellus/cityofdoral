// Shared chat processor for all channels (Web, IVR, SMS, Social)
// Reuses the same RAG + LLM pipeline

import OpenAI from 'openai';
import { detectLanguage, getSystemPrompt } from '@/lib/i18n';
import { analyzeSentiment } from '@/lib/sentiment';
import { ChannelType, ChannelResponse } from './types';
import { getSessionHistory, addMessageToSession, updateSessionLanguage } from './session-manager';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

interface KnowledgeResult {
  id: string;
  title: string;
  section: string;
  url: string;
  content: string;
  summary: string;
  score: number;
}

async function getKnowledgeContext(query: string, limit = 5): Promise<KnowledgeResult[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit, includeContent: true }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function buildContextString(results: KnowledgeResult[]): string {
  if (results.length === 0) {
    return 'No specific information found in the knowledge base for this query.';
  }
  return results
    .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.content}\n`)
    .join('\n---\n');
}

export interface ProcessChatOptions {
  channel: ChannelType;
  userId: string;
  message: string;
  requestedLanguage?: 'en' | 'es';
}

export async function processChat(options: ProcessChatOptions): Promise<ChannelResponse> {
  const { channel, userId, message, requestedLanguage } = options;

  // Get conversation history for session continuity
  const history = await getSessionHistory(channel, userId);

  // Add user message to session
  await addMessageToSession(channel, userId, 'user', message);

  // Detect language
  const detectedLanguage = requestedLanguage || detectLanguage(message);
  await updateSessionLanguage(channel, userId, detectedLanguage);

  // Analyze sentiment
  const sentiment = analyzeSentiment(message);

  // Fetch relevant knowledge
  const knowledgeResults = await getKnowledgeContext(message);
  const contextString = buildContextString(knowledgeResults);

  // Build system prompt
  const systemPrompt = getSystemPrompt(detectedLanguage, contextString, sentiment);

  // Prepare messages for OpenAI (include history for context)
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  // Call OpenAI
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: channel === 'sms' ? 320 : 1000, // SMS has 160-char segments
  });

  const assistantMessage = completion.choices[0]?.message?.content ||
    (detectedLanguage === 'es'
      ? 'Lo siento, no pude procesar su solicitud.'
      : 'I apologize, I could not process your request.');

  // Add assistant message to session
  await addMessageToSession(channel, userId, 'assistant', assistantMessage);

  // Prepare sources
  const sources = knowledgeResults.map(r => ({
    title: r.title,
    url: r.url,
  }));

  const escalate = sentiment.category === 'negative' || sentiment.category === 'urgent';

  return {
    message: assistantMessage,
    language: detectedLanguage,
    sentiment: sentiment.category,
    sources,
    escalate,
    conversationId: `${channel}_${userId}_${Date.now()}`,
  };
}

// Log channel conversation for analytics
export async function logChannelConversation(
  channel: ChannelType,
  userId: string,
  userMessage: string,
  assistantMessage: string,
  language: string,
  sentiment: string,
  escalated: boolean
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        userId,
        userMessage,
        assistantMessage,
        language,
        sentiment,
        escalated,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to log channel conversation:', error);
  }
}
