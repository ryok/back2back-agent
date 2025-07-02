# Back2Back DJ - Human x AI Collaboration

A web application that enables collaborative DJing between humans and AI agents using the Mastra framework.

## Features

- **AI DJ Agent**: Intelligent track selection based on BPM, key compatibility, and energy levels
- **Real-time Collaboration**: Human and AI DJs can mix tracks together in a Back2Back style
- **Smart Mixing**: Automatic beatmatching and transition planning
- **Track Analysis**: Compatibility scoring between tracks
- **Interactive Interface**: Visual DJ decks with crossfader control

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Spotify App:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://localhost:3000/api/auth/spotify/callback` to Redirect URIs
   - Copy your Client ID and Client Secret

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Spotify Client ID and Client Secret
   - Add your OpenAI API key (or Anthropic API key) for AI features

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser
7. Login with your Spotify Premium account

## How it Works

1. **Start a Session**: Click "Start Session" to begin a Back2Back DJ set
2. **Load Tracks**: Select tracks from the library to load on the human deck
3. **AI Recommendations**: Click "Request AI Selection" to have the AI DJ choose a compatible track
4. **Mix Control**: Use the crossfader to blend between human and AI tracks
5. **Smooth Transitions**: The AI analyzes BPM, key, and energy to suggest optimal mixing points

## Tech Stack

- **Mastra**: AI agent framework for building the DJ agent
- **Next.js**: React framework for the web interface
- **TypeScript**: Type-safe development
- **Zod**: Schema validation for agent tools

## Project Structure

- `/src/agents/`: DJ agent with track selection and mixing logic
- `/src/workflows/`: DJ session workflow management
- `/src/app/`: Next.js app with UI components
- `/src/types/`: TypeScript type definitions

## Future Enhancements

- Real audio playback with Web Audio API
- Spotify/SoundCloud integration
- Advanced effects and looping
- Recording and export functionality
- Multi-user sessions
- Machine learning for crowd reading