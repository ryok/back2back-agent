import { NextRequest, NextResponse } from 'next/server';
import type { DJSession } from '../../../types/dj';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { humanDJ, initialTrack } = body;
    
    const sessionId = `session-${Date.now()}`;
    
    const session: DJSession = {
      id: sessionId,
      humanDJ,
      agentDJ: 'AI DJ Assistant',
      tracks: [initialTrack],
      currentTrack: initialTrack,
      nextTrack: null,
      mixPoint: 0,
      isPlaying: true,
      createdAt: new Date(),
    };
    
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}