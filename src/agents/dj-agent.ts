import { Agent } from '@mastra/core';
import { z } from 'zod';
import type { Track, MixDecision } from '../types/dj.js';

const trackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  bpm: z.number(),
  key: z.string(),
  duration: z.number(),
  genre: z.string(),
  energy: z.number(),
  url: z.string().optional(),
});

export const djAgent = new Agent({
  name: 'DJ Agent',
  instructions: `You are an expert DJ with deep knowledge of music theory, beatmatching, and crowd dynamics.
Your role is to collaborate with human DJs in a Back2Back session, making intelligent track selections
and smooth transitions. Consider:
- BPM compatibility (within 5-10% for smooth mixing)
- Key compatibility (using the Camelot wheel)
- Energy levels and crowd flow
- Genre compatibility and progression
- Creative mixing techniques`,
  
  model: {
    provider: 'OPENAI',
    name: 'gpt-4',
  },

  tools: {
    selectNextTrack: {
      description: 'Select the next track based on current track and available library',
      parameters: z.object({
        currentTrack: trackSchema,
        availableTracks: z.array(trackSchema),
        sessionContext: z.object({
          previousTracks: z.array(trackSchema),
          crowdEnergy: z.number().min(0).max(10),
          timeInSet: z.number(),
        }),
      }),
      execute: async ({ currentTrack, availableTracks, sessionContext }) => {
        // Filter tracks by BPM compatibility
        const bpmRange = currentTrack.bpm * 0.1;
        const compatibleTracks = availableTracks.filter(track => 
          Math.abs(track.bpm - currentTrack.bpm) <= bpmRange &&
          track.id !== currentTrack.id
        );

        // Sort by energy and key compatibility
        const sortedTracks = compatibleTracks.sort((a, b) => {
          const energyDiff = Math.abs(a.energy - sessionContext.crowdEnergy) - 
                             Math.abs(b.energy - sessionContext.crowdEnergy);
          return energyDiff;
        });

        const selectedTrack = sortedTracks[0];
        
        return {
          track: selectedTrack,
          reasoning: `Selected ${selectedTrack.title} by ${selectedTrack.artist} - BPM: ${selectedTrack.bpm}, Energy: ${selectedTrack.energy}`,
        };
      },
    },

    planMixTransition: {
      description: 'Plan the transition between two tracks',
      parameters: z.object({
        fromTrack: trackSchema,
        toTrack: trackSchema,
      }),
      execute: async ({ fromTrack, toTrack }) => {
        const bpmDifference = Math.abs(fromTrack.bpm - toTrack.bpm);
        let transitionType: MixDecision['transitionType'] = 'beatmatch';
        
        if (bpmDifference > 20) {
          transitionType = 'cut';
        } else if (bpmDifference > 10) {
          transitionType = 'effect';
        }

        const mixPoint = fromTrack.duration * 0.85; // Mix at 85% of track

        const decision: MixDecision = {
          fromTrack,
          toTrack,
          mixPoint,
          transitionType,
          reasoning: `Using ${transitionType} transition due to BPM difference of ${bpmDifference}`,
        };

        return decision;
      },
    },

    analyzeTrackCompatibility: {
      description: 'Analyze compatibility between two tracks',
      parameters: z.object({
        track1: trackSchema,
        track2: trackSchema,
      }),
      execute: async ({ track1, track2 }) => {
        const bpmDiff = Math.abs(track1.bpm - track2.bpm);
        const bpmScore = Math.max(0, 100 - bpmDiff * 2);
        
        const energyDiff = Math.abs(track1.energy - track2.energy);
        const energyScore = Math.max(0, 100 - energyDiff * 10);
        
        const genreMatch = track1.genre === track2.genre ? 100 : 50;
        
        const overallScore = (bpmScore + energyScore + genreMatch) / 3;
        
        return {
          compatibility: overallScore,
          bpmScore,
          energyScore,
          genreMatch,
          recommendation: overallScore > 70 ? 'Great match!' : overallScore > 50 ? 'Could work' : 'Challenging mix',
        };
      },
    },
  },
});