import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, currentTrack, availableTracks } = body;
    
    // Simple mock AI selection - in production, this would use the Mastra agent
    const filteredTracks = availableTracks.filter((track: any) => 
      track.id !== currentTrack.id &&
      Math.abs(track.bpm - currentTrack.bpm) <= 10
    );
    
    const selectedTrack = filteredTracks[Math.floor(Math.random() * filteredTracks.length)] || availableTracks[0];
    
    return NextResponse.json({
      track: selectedTrack,
      reasoning: `Selected ${selectedTrack.title} - compatible BPM and energy level`,
      mixDecision: {
        fromTrack: currentTrack,
        toTrack: selectedTrack,
        mixPoint: currentTrack.duration * 0.85,
        transitionType: 'beatmatch',
        reasoning: 'Using beatmatch for smooth transition',
      },
    });
  } catch (error) {
    console.error('Failed to get next track:', error);
    return NextResponse.json(
      { error: 'Failed to get next track' },
      { status: 500 }
    );
  }
}