export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: number;
  genre: string;
  energy: number;
  url?: string;
  spotifyUri?: string;
  spotifyId?: string;
  previewUrl?: string;
  albumArt?: string;
}

export interface DJSession {
  id: string;
  humanDJ: string;
  agentDJ: string;
  tracks: Track[];
  currentTrack: Track | null;
  nextTrack: Track | null;
  mixPoint: number;
  isPlaying: boolean;
  createdAt: Date;
}

export interface MixDecision {
  fromTrack: Track;
  toTrack: Track;
  mixPoint: number;
  transitionType: 'beatmatch' | 'cut' | 'fade' | 'effect';
  reasoning: string;
}

export interface DJAction {
  type: 'select_track' | 'mix' | 'effect' | 'loop' | 'cue';
  track?: Track;
  parameters?: Record<string, any>;
  timestamp: number;
}