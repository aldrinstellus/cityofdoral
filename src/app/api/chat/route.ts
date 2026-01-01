import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { detectLanguage, getSystemPrompt } from '@/lib/i18n';
import { analyzeSentiment } from '@/lib/sentiment';
import { promises as fs } from 'fs';
import path from 'path';

// CORS headers for cross-origin widget requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

function getAnthropic(): Anthropic | null {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationLogEntry {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  language: string;
  sentiment: string;
  escalated: boolean;
  feedbackGiven: boolean;
  userAgent: string;
  referrer: string;
}

const CONVERSATIONS_FILE = path.join(process.cwd(), 'data', 'conversations.json');

async function logConversation(entry: ConversationLogEntry): Promise<void> {
  try {
    let data: { conversations: ConversationLogEntry[]; lastUpdated: string | null } = { conversations: [], lastUpdated: null };
    try {
      const content = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch {
      // File doesn't exist, use default
    }
    data.conversations.push(entry);
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to log conversation:', error);
  }
}

// Fetch relevant context from knowledge base
async function getKnowledgeContext(query: string, limit = 5, domain?: string): Promise<KnowledgeResult[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit, includeContent: true, domain }),
    });

    if (!response.ok) {
      console.error('Knowledge API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch knowledge context:', error);
    return [];
  }
}

// Build context string from knowledge results
function buildContextString(results: KnowledgeResult[]): string {
  if (results.length === 0) {
    return 'No specific information found in the knowledge base for this query.';
  }

  return results
    .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.content}\n`)
    .join('\n---\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, language: requestedLanguage, domain } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the last user message for context retrieval
    const lastUserMessage = messages
      .filter((m: ChatMessage) => m.role === 'user')
      .pop();

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400, headers: corsHeaders }
      );
    }

    const userQuery = lastUserMessage.content;

    // Detect language from user message
    const detectedLanguage = requestedLanguage || detectLanguage(userQuery);

    // Analyze sentiment
    const sentiment = analyzeSentiment(userQuery);

    // Fetch relevant knowledge (with domain filtering for multi-URL support)
    const knowledgeResults = await getKnowledgeContext(userQuery, 5, domain);
    const contextString = buildContextString(knowledgeResults);

    // Build system prompt with context
    const systemPrompt = getSystemPrompt(detectedLanguage, contextString, sentiment);

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let assistantMessage: string;

    // Try OpenAI first, fallback to Claude if it fails (ITN 3.2.3 LLM Backup)
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      assistantMessage = completion.choices[0]?.message?.content || '';
    } catch (openaiError) {
      console.error('OpenAI API error, attempting Claude fallback:', openaiError);

      // Try Claude fallback
      const claudeClient = getAnthropic();
      if (claudeClient) {
        try {
          const claudeMessages = messages.map((m: ChatMessage) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

          const claudeResponse = await claudeClient.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            system: systemPrompt,
            messages: claudeMessages,
          });

          assistantMessage = claudeResponse.content[0].type === 'text'
            ? claudeResponse.content[0].text
            : '';
          console.log('Successfully used Claude fallback');
        } catch (claudeError) {
          console.error('Claude fallback also failed:', claudeError);
          assistantMessage = '';
        }
      } else {
        console.warn('No Claude API key configured for fallback');
        assistantMessage = '';
      }
    }

    // Default message if both LLMs failed
    if (!assistantMessage) {
      assistantMessage = detectedLanguage === 'es'
        ? 'Lo siento, no pude procesar su solicitud. Por favor intente de nuevo.'
        : 'I apologize, I could not process your request. Please try again.';
    }

    // Prepare sources for response
    const sources = knowledgeResults.map(r => ({
      title: r.title,
      url: r.url,
      section: r.section,
    }));

    const escalate = sentiment.category === 'negative' || sentiment.category === 'urgent';

    // Log conversation for audit trail (ITN 3.1.3)
    const sessionId = body.sessionId || `session_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const logEntry: ConversationLogEntry = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      startTime: timestamp,
      endTime: timestamp,
      messages: [
        ...messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
          timestamp,
        })),
        {
          role: 'assistant',
          content: assistantMessage,
          timestamp,
        },
      ],
      language: detectedLanguage,
      sentiment: sentiment.category,
      escalated: escalate,
      feedbackGiven: false,
      userAgent: request.headers.get('user-agent') || 'unknown',
      referrer: request.headers.get('referer') || 'unknown',
    };

    // Log asynchronously (don't block response)
    logConversation(logEntry).catch(console.error);

    return NextResponse.json({
      message: assistantMessage,
      language: detectedLanguage,
      sentiment: sentiment.category,
      sentimentScore: sentiment.score,
      sources,
      escalate,
      conversationId: logEntry.id,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Chat API error:', error);

    // Check if it's an OpenAI API key issue
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: 'OpenAI API configuration error',
          message: 'The AI service is not properly configured. Please contact support.'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'I apologize, but I encountered an issue. Please try again.'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
