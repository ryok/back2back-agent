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
  spotifyUri: z.string().optional(),
  spotifyId: z.string().optional(),
});

// House/Techno専門のDJエージェント
export const technoAgent = new Agent({
  name: 'DJ TechMaster',
  instructions: `You are a veteran techno and house DJ with 20 years of experience in underground clubs.
Your style focuses on:
- Deep, driving basslines and hypnotic rhythms
- Building tension through long, gradual transitions
- Preference for minimal techno, acid house, and deep house
- BPM range: 120-135
- Always maintain the groove and never let the energy drop suddenly`,
  
  model: {
    provider: 'OPENAI',
    name: 'gpt-4',
  },

  tools: {
    selectNextTrack: createSelectTrackTool('techno'),
    planMixTransition: createMixTransitionTool('long_blend'),
  },
});

// EDM/Festival DJエージェント
export const festivalAgent = new Agent({
  name: 'DJ Festival King',
  instructions: `You are a high-energy festival DJ who knows how to control massive crowds.
Your style focuses on:
- Big drops and emotional buildups
- Quick cuts and surprising transitions
- Preference for big room house, progressive house, and future bass
- BPM range: 126-140
- Create moments of tension and explosive releases`,
  
  model: {
    provider: 'OPENAI',
    name: 'gpt-4',
  },

  tools: {
    selectNextTrack: createSelectTrackTool('festival'),
    planMixTransition: createMixTransitionTool('quick_cut'),
  },
});

// Hip-Hop/R&B DJエージェント
export const hiphopAgent = new Agent({
  name: 'DJ Scratch Master',
  instructions: `You are a hip-hop DJ with turntablist skills and deep knowledge of hip-hop culture.
Your style focuses on:
- Smooth transitions between different BPMs
- Scratching and beat juggling techniques
- Preference for classic hip-hop, trap, and R&B
- BPM range: 70-100 (with double-time possibilities)
- Respect the groove and the pocket of each track`,
  
  model: {
    provider: 'OPENAI',
    name: 'gpt-4',
  },

  tools: {
    selectNextTrack: createSelectTrackTool('hiphop'),
    planMixTransition: createMixTransitionTool('scratch'),
  },
});

// Eclectic/Multi-genre DJエージェント  
export const eclecticAgent = new Agent({
  name: 'DJ Wanderer',
  instructions: `You are an eclectic DJ who travels through different genres and eras.
Your style focuses on:
- Creative genre-blending and unexpected combinations
- Finding connections between seemingly unrelated tracks
- No genre boundaries - from jazz to drum'n'bass
- BPM range: Any
- Tell a musical story through your selections`,
  
  model: {
    provider: 'OPENAI',
    name: 'gpt-4',
  },

  tools: {
    selectNextTrack: createSelectTrackTool('eclectic'),
    planMixTransition: createMixTransitionTool('creative'),
  },
});

// Helper function to create track selection tool with style preferences
function createSelectTrackTool(style: string) {
  return {
    description: `Select the next track based on ${style} DJ style`,
    parameters: z.object({
      currentTrack: trackSchema,
      availableTracks: z.array(trackSchema),
      sessionContext: z.object({
        previousTracks: z.array(trackSchema),
        crowdEnergy: z.number().min(0).max(10),
        timeInSet: z.number(),
      }),
    }),
    execute: async ({ currentTrack, availableTracks, sessionContext }: any) => {
      // Style-specific filtering logic
      let filteredTracks = availableTracks;
      
      switch (style) {
        case 'techno':
          filteredTracks = availableTracks.filter(track => 
            ['Techno', 'House', 'Minimal', 'Acid'].some(g => track.genre.includes(g)) &&
            track.bpm >= 120 && track.bpm <= 135
          );
          break;
        case 'festival':
          filteredTracks = availableTracks.filter(track => 
            ['EDM', 'House', 'Progressive', 'Future'].some(g => track.genre.includes(g)) &&
            track.energy >= 7
          );
          break;
        case 'hiphop':
          filteredTracks = availableTracks.filter(track => 
            ['Hip-Hop', 'Rap', 'Trap', 'R&B'].some(g => track.genre.includes(g))
          );
          break;
        // eclectic doesn't filter by genre
      }

      // Common selection logic
      const bpmRange = currentTrack.bpm * 0.1;
      const compatibleTracks = filteredTracks.filter(track => 
        Math.abs(track.bpm - currentTrack.bpm) <= bpmRange &&
        track.id !== currentTrack.id
      );

      if (compatibleTracks.length === 0) {
        // Fallback to wider selection
        compatibleTracks.push(...filteredTracks.filter(t => t.id !== currentTrack.id));
      }

      // Sort by energy compatibility
      const sortedTracks = compatibleTracks.sort((a, b) => {
        const energyDiff = Math.abs(a.energy - sessionContext.crowdEnergy) - 
                          Math.abs(b.energy - sessionContext.crowdEnergy);
        return energyDiff;
      });

      const selectedTrack = sortedTracks[0] || availableTracks[0];
      
      return {
        track: selectedTrack,
        reasoning: `${style} selection: ${selectedTrack.title} - matches style and energy requirements`,
      };
    },
  };
}

// Helper function to create mix transition tool with style preferences
function createMixTransitionTool(transitionStyle: string) {
  return {
    description: `Plan the mix transition using ${transitionStyle} technique`,
    parameters: z.object({
      fromTrack: trackSchema,
      toTrack: trackSchema,
    }),
    execute: async ({ fromTrack, toTrack }: any) => {
      const bpmDifference = Math.abs(fromTrack.bpm - toTrack.bpm);
      let transitionType: MixDecision['transitionType'] = 'beatmatch';
      let mixPoint = fromTrack.duration * 0.85;
      
      switch (transitionStyle) {
        case 'long_blend':
          transitionType = 'beatmatch';
          mixPoint = fromTrack.duration * 0.75; // Earlier mix for longer blend
          break;
        case 'quick_cut':
          transitionType = bpmDifference > 10 ? 'cut' : 'fade';
          mixPoint = fromTrack.duration * 0.9; // Later mix for quick transition
          break;
        case 'scratch':
          transitionType = 'cut'; // Always cut for scratch transitions
          mixPoint = fromTrack.duration * 0.95;
          break;
        case 'creative':
          // Random creative transitions
          const types: MixDecision['transitionType'][] = ['beatmatch', 'cut', 'fade', 'effect'];
          transitionType = types[Math.floor(Math.random() * types.length)];
          mixPoint = fromTrack.duration * (0.7 + Math.random() * 0.2);
          break;
      }

      const decision: MixDecision = {
        fromTrack,
        toTrack,
        mixPoint,
        transitionType,
        reasoning: `${transitionStyle} transition: ${transitionType} at ${Math.round(mixPoint)}s`,
      };

      return decision;
    },
  };
}

export const DJ_PERSONAS = {
  techno: technoAgent,
  festival: festivalAgent,
  hiphop: hiphopAgent,
  eclectic: eclecticAgent,
};

export type DJPersonaType = keyof typeof DJ_PERSONAS;