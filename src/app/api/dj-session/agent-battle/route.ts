import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '../../../../mastra.config';
import type { DJPersonaType } from '../../../../agents/dj-personas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent1Type, agent2Type } = body;
    
    const sessionId = `battle-${Date.now()}`;
    
    // Initialize the agent battle workflow
    const result = await mastra.workflows.agentBattleWorkflow.execute({
      triggerData: {
        sessionId,
        agent1Type: agent1Type as DJPersonaType,
        agent2Type: agent2Type as DJPersonaType,
        initialTrack: {
          id: 'init-1',
          title: 'Opening Track',
          artist: 'DJ System',
          bpm: 128,
          key: '8A',
          duration: 300,
          genre: 'Electronic',
          energy: 5,
        },
        availableTracks: [], // Will be populated by agents
      },
    });
    
    return NextResponse.json({ 
      sessionId,
      battleInitialized: true,
      agents: {
        agent1: agent1Type,
        agent2: agent2Type,
      },
    });
  } catch (error) {
    console.error('Failed to initialize agent battle:', error);
    return NextResponse.json(
      { error: 'Failed to initialize agent battle' },
      { status: 500 }
    );
  }
}