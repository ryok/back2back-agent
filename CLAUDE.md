# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build production-ready application
- `npm run start` - Run production server
- `npm run mastra:dev` - Start Mastra development environment for AI agent testing
- `npm run mastra:build` - Build Mastra agents and workflows
- `npm run mastra:start` - Run Mastra in production mode

### Environment Setup
Before running the application:
1. Copy `.env.example` to `.env`
2. Add required API keys:
   - `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard
   - `SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback`
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - For AI agent functionality

## Architecture Overview

This is a Back2Back DJ application enabling collaborative mixing between humans and AI agents.

### Core Components

1. **AI DJ Agent** (`/src/agents/dj-agent.ts`)
   - Uses Mastra framework with OpenAI/Anthropic models
   - Tools: `selectNextTrack`, `planMixTransition`, `analyzeTrackCompatibility`
   - Considers BPM compatibility (±10%), key compatibility (Camelot wheel), energy levels, and genre

2. **DJ Session Workflow** (`/src/workflows/dj-session-workflow.ts`)
   - Manages Back2Back sessions between human and AI
   - Steps: `initializeSession`, `monitorTrackProgress`, `agentSelectTrack`, `planTransition`, `executeMix`
   - Triggers AI track selection when current track reaches 70% completion

3. **Web Interface** (Next.js App Router in `/src/app/`)
   - Main page: Interactive DJ decks with crossfader
   - API routes:
     - `/api/dj-session` - Create new DJ session
     - `/api/dj-session/next-track` - AI track selection endpoint
   - Components: `DJDeck`, `Mixer`, `TrackLibrary`, `SessionInfo`

4. **Type System** (`/src/types/dj.ts`)
   - Core types: `Track`, `DJSession`, `MixDecision`, `DJAction`
   - Track properties include: BPM, key, energy, genre for mixing compatibility

### Key Design Decisions

- **Mastra Integration**: The AI agent is built using Mastra's typed tools system, allowing structured interaction between the UI and AI
- **Track Compatibility**: Uses music theory principles (BPM matching, harmonic mixing via Camelot wheel)
- **Real-time Collaboration**: Crossfader controls audio blend between human and AI decks
- **TypeScript**: Strict mode enabled with ES2022 target for modern features

### Development Notes

- The project uses ES modules (`"type": "module"` in package.json)
- Next.js 15 with experimental server actions enabled
- Currently uses mock track data - future enhancement would integrate real audio APIs
- Audio playback is simulated - implementing Web Audio API is a planned feature