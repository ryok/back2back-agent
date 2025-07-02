import { Workflow } from '@mastra/core';
import { z } from 'zod';
import type { Track, DJSession } from '../types/dj.js';
import { DJ_PERSONAS, type DJPersonaType } from '../agents/dj-personas.js';

export const agentBattleWorkflow = new Workflow({
  name: 'Agent Battle Workflow',
  description: 'Manages a Back2Back battle between two AI DJ agents',
  
  trigger: {
    schema: z.object({
      sessionId: z.string(),
      agent1Type: z.enum(['techno', 'festival', 'hiphop', 'eclectic']),
      agent2Type: z.enum(['techno', 'festival', 'hiphop', 'eclectic']),
      initialTrack: z.object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        bpm: z.number(),
        key: z.string(),
        duration: z.number(),
        genre: z.string(),
        energy: z.number(),
        spotifyUri: z.string().optional(),
      }),
      availableTracks: z.array(z.any()),
    }),
  },

  steps: {
    initializeBattle: {
      run: async ({ context }) => {
        const agent1 = DJ_PERSONAS[context.agent1Type as DJPersonaType];
        const agent2 = DJ_PERSONAS[context.agent2Type as DJPersonaType];
        
        const session: DJSession = {
          id: context.sessionId,
          humanDJ: agent1.name,
          agentDJ: agent2.name,
          tracks: [context.initialTrack],
          currentTrack: context.initialTrack,
          nextTrack: null,
          mixPoint: 0,
          isPlaying: true,
          createdAt: new Date(),
        };
        
        return {
          session,
          currentAgent: 'agent1',
          agent1Score: 0,
          agent2Score: 0,
          roundNumber: 1,
        };
      },
    },

    selectNextTrack: {
      run: async ({ context, agents }) => {
        const { session, currentAgent, availableTracks } = context;
        const agentType = currentAgent === 'agent1' ? context.agent1Type : context.agent2Type;
        const agent = DJ_PERSONAS[agentType as DJPersonaType];
        
        try {
          const result = await agent.generate({
            prompt: `As ${agent.name}, select your next track to show your DJ skills`,
            tools: ['selectNextTrack'],
            toolChoice: {
              type: 'required',
              toolName: 'selectNextTrack',
            },
            variables: {
              currentTrack: session.currentTrack,
              availableTracks: availableTracks,
              sessionContext: {
                previousTracks: session.tracks,
                crowdEnergy: 7 + Math.random() * 3, // Simulate dynamic crowd
                timeInSet: session.tracks.length * 5,
              },
            },
          });

          const selectedTrack = result.toolCalls[0].result.track;
          const reasoning = result.toolCalls[0].result.reasoning;
          
          return {
            nextTrack: selectedTrack,
            reasoning,
            agentName: agent.name,
          };
        } catch (error) {
          console.error('Agent track selection failed:', error);
          // Fallback selection
          return {
            nextTrack: availableTracks[0],
            reasoning: 'Fallback selection due to error',
            agentName: agent.name,
          };
        }
      },
    },

    planTransition: {
      run: async ({ context, agents }) => {
        const { session, nextTrack, currentAgent } = context;
        const agentType = currentAgent === 'agent1' ? context.agent1Type : context.agent2Type;
        const agent = DJ_PERSONAS[agentType as DJPersonaType];
        
        try {
          const result = await agent.generate({
            prompt: 'Plan your signature mix transition',
            tools: ['planMixTransition'],
            toolChoice: {
              type: 'required',
              toolName: 'planMixTransition',
            },
            variables: {
              fromTrack: session.currentTrack,
              toTrack: nextTrack,
            },
          });

          return {
            mixDecision: result.toolCalls[0].result,
          };
        } catch (error) {
          console.error('Transition planning failed:', error);
          // Fallback transition
          return {
            mixDecision: {
              fromTrack: session.currentTrack,
              toTrack: nextTrack,
              mixPoint: session.currentTrack.duration * 0.85,
              transitionType: 'beatmatch',
              reasoning: 'Fallback transition',
            },
          };
        }
      },
    },

    scoreTransition: {
      run: async ({ context }) => {
        const { mixDecision, currentAgent } = context;
        
        // Scoring based on transition quality
        let score = 0;
        
        // BPM compatibility
        const bpmDiff = Math.abs(mixDecision.fromTrack.bpm - mixDecision.toTrack.bpm);
        if (bpmDiff <= 5) score += 30;
        else if (bpmDiff <= 10) score += 20;
        else if (bpmDiff <= 15) score += 10;
        
        // Key compatibility (simplified)
        score += 20; // Placeholder for actual key analysis
        
        // Energy flow
        const energyDiff = Math.abs(mixDecision.fromTrack.energy - mixDecision.toTrack.energy);
        if (energyDiff <= 2) score += 20;
        else if (energyDiff <= 4) score += 10;
        
        // Transition creativity
        if (mixDecision.transitionType === 'effect') score += 10;
        if (mixDecision.transitionType === 'cut' && bpmDiff > 10) score += 15;
        
        // Update scores
        const newAgent1Score = currentAgent === 'agent1' 
          ? context.agent1Score + score 
          : context.agent1Score;
        const newAgent2Score = currentAgent === 'agent2' 
          ? context.agent2Score + score 
          : context.agent2Score;
        
        return {
          transitionScore: score,
          agent1Score: newAgent1Score,
          agent2Score: newAgent2Score,
        };
      },
    },

    updateSession: {
      run: async ({ context }) => {
        const { session, nextTrack, mixDecision, currentAgent, roundNumber } = context;
        
        // Update session
        const updatedSession = {
          ...session,
          currentTrack: nextTrack,
          tracks: [...session.tracks, nextTrack],
          mixPoint: mixDecision.mixPoint,
        };
        
        // Switch agents
        const nextAgent = currentAgent === 'agent1' ? 'agent2' : 'agent1';
        const nextRound = currentAgent === 'agent2' ? roundNumber + 1 : roundNumber;
        
        return {
          session: updatedSession,
          currentAgent: nextAgent,
          roundNumber: nextRound,
          lastTransition: mixDecision,
        };
      },
    },

    checkBattleEnd: {
      run: async ({ context }) => {
        const { roundNumber, agent1Score, agent2Score } = context;
        const maxRounds = 5; // 5 rounds each = 10 tracks total
        
        if (roundNumber > maxRounds) {
          const winner = agent1Score > agent2Score 
            ? { name: DJ_PERSONAS[context.agent1Type as DJPersonaType].name, type: context.agent1Type }
            : { name: DJ_PERSONAS[context.agent2Type as DJPersonaType].name, type: context.agent2Type };
          
          return {
            battleEnded: true,
            winner,
            finalScores: {
              agent1: { name: DJ_PERSONAS[context.agent1Type as DJPersonaType].name, score: agent1Score },
              agent2: { name: DJ_PERSONAS[context.agent2Type as DJPersonaType].name, score: agent2Score },
            },
          };
        }
        
        return { battleEnded: false };
      },
    },
  },
});