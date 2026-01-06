// IVR Demo Session API - manages demo sessions for transfer code testing

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateSession,
  addMessageToSession,
  generateCrossChannelToken,
} from '@/lib/channels/session-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, role, content } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (action === 'add-message') {
      // Create session if needed and add message
      await getOrCreateSession('ivr', userId, 'en');
      await addMessageToSession('ivr', userId, role || 'assistant', content || '');

      return NextResponse.json({ success: true });
    }

    if (action === 'generate-token') {
      // Ensure session exists first (needed for serverless environments)
      await getOrCreateSession('ivr', userId, 'en');
      // Generate cross-channel transfer token
      const token = await generateCrossChannelToken('ivr', userId);
      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[IVR Demo Session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
