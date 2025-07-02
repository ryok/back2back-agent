'use client';

import { useState, useEffect } from 'react';
import { DJDeck } from './DJDeck';
import { Mixer } from './Mixer';
import type { Track } from '../types/dj';
import type { DJPersonaType } from '../agents/dj-personas';

interface AgentBattleProps {
  spotifyToken: string | null;
  onSelectTrack: (track: Track) => void;
  onBack: () => void;
}

interface BattleState {
  agent1: {
    type: DJPersonaType;
    name: string;
    score: number;
    currentTrack: Track | null;
  };
  agent2: {
    type: DJPersonaType;
    name: string;
    score: number;
    currentTrack: Track | null;
  };
  currentTurn: 'agent1' | 'agent2';
  roundNumber: number;
  isActive: boolean;
  transitions: Array<{
    agent: string;
    from: string;
    to: string;
    score: number;
    technique: string;
  }>;
}

const DJ_PERSONAS_INFO = {
  techno: { name: 'DJ TechMaster', emoji: '🎛️', color: '#FF00FF' },
  festival: { name: 'DJ Festival King', emoji: '🎆', color: '#FFD700' },
  hiphop: { name: 'DJ Scratch Master', emoji: '🎤', color: '#FF4500' },
  eclectic: { name: 'DJ Wanderer', emoji: '🌍', color: '#00CED1' },
};

export function AgentBattleMode({ spotifyToken, onSelectTrack, onBack }: AgentBattleProps) {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [agent1Type, setAgent1Type] = useState<DJPersonaType>('techno');
  const [agent2Type, setAgent2Type] = useState<DJPersonaType>('festival');
  const [crossfaderPosition, setCrossfaderPosition] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const startBattle = async () => {
    setIsLoading(true);
    setBattleLog(['🎯 Battle Starting...']);
    
    // Initialize battle state
    setBattleState({
      agent1: {
        type: agent1Type,
        name: DJ_PERSONAS_INFO[agent1Type].name,
        score: 0,
        currentTrack: null,
      },
      agent2: {
        type: agent2Type,
        name: DJ_PERSONAS_INFO[agent2Type].name,
        score: 0,
        currentTrack: null,
      },
      currentTurn: 'agent1',
      roundNumber: 1,
      isActive: true,
      transitions: [],
    });

    // Start the battle workflow
    try {
      const response = await fetch('/api/dj-session/agent-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent1Type,
          agent2Type,
        }),
      });

      const data = await response.json();
      console.log('Battle initialized:', data);
      
      // Start the battle loop
      performAgentTurn('agent1');
    } catch (error) {
      console.error('Failed to start battle:', error);
      setBattleLog(prev => [...prev, '❌ Failed to start battle']);
    } finally {
      setIsLoading(false);
    }
  };

  const performAgentTurn = async (agent: 'agent1' | 'agent2') => {
    if (!battleState || !spotifyToken) return;
    
    const agentInfo = agent === 'agent1' ? battleState.agent1 : battleState.agent2;
    setBattleLog(prev => [...prev, `🎵 ${agentInfo.name} is selecting a track...`]);
    
    try {
      // Search for tracks based on agent's style
      const searchQuery = getSearchQueryForAgent(agentInfo.type);
      const searchResponse = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const searchData = await searchResponse.json();
      
      if (searchData.tracks && searchData.tracks.length > 0) {
        // Simulate agent decision making
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get audio features for tracks
        const tracksWithFeatures = await Promise.all(
          searchData.tracks.slice(0, 10).map(async (track: Track) => {
            try {
              const featuresResponse = await fetch(`/api/spotify/track/${track.spotifyId}/audio-features`);
              if (featuresResponse.ok) {
                const features = await featuresResponse.json();
                return {
                  ...track,
                  bpm: features.bpm,
                  key: features.key,
                  energy: features.energy,
                };
              }
            } catch (error) {
              console.error('Failed to get audio features:', error);
            }
            return track;
          })
        );
        
        // Agent makes selection (simplified logic)
        const selectedTrack = selectTrackForAgent(tracksWithFeatures, agentInfo.type, battleState);
        
        // Update battle state
        setBattleState(prev => {
          if (!prev) return null;
          
          const newState = { ...prev };
          if (agent === 'agent1') {
            newState.agent1.currentTrack = selectedTrack;
          } else {
            newState.agent2.currentTrack = selectedTrack;
          }
          
          // Calculate transition score if both have tracks
          if (newState.agent1.currentTrack && newState.agent2.currentTrack) {
            const score = calculateTransitionScore(
              agent === 'agent1' ? newState.agent2.currentTrack : newState.agent1.currentTrack,
              selectedTrack
            );
            
            if (agent === 'agent1') {
              newState.agent1.score += score;
            } else {
              newState.agent2.score += score;
            }
            
            newState.transitions.push({
              agent: agentInfo.name,
              from: agent === 'agent1' 
                ? newState.agent2.currentTrack.title 
                : newState.agent1.currentTrack.title,
              to: selectedTrack.title,
              score,
              technique: getTransitionTechnique(agentInfo.type),
            });
          }
          
          // Switch turns
          newState.currentTurn = agent === 'agent1' ? 'agent2' : 'agent1';
          
          // Check if round is complete
          if (agent === 'agent2') {
            newState.roundNumber++;
          }
          
          return newState;
        });
        
        setBattleLog(prev => [...prev, 
          `✅ ${agentInfo.name} selected: ${selectedTrack.title} by ${selectedTrack.artist}`,
          `🎯 Transition score: ${calculateTransitionScore(
            battleState.agent1.currentTrack || selectedTrack,
            selectedTrack
          )} points`
        ]);
        
        // Load track to the appropriate deck
        onSelectTrack(selectedTrack);
        
        // Auto-adjust crossfader
        setCrossfaderPosition(agent === 'agent1' ? 20 : 80);
        
        // Continue battle after delay
        if (battleState.roundNumber < 5) {
          setTimeout(() => {
            performAgentTurn(agent === 'agent1' ? 'agent2' : 'agent1');
          }, 5000);
        } else {
          endBattle();
        }
      }
    } catch (error) {
      console.error('Agent turn failed:', error);
      setBattleLog(prev => [...prev, `❌ ${agentInfo.name} failed to select track`]);
    }
  };

  const getSearchQueryForAgent = (type: DJPersonaType): string => {
    switch (type) {
      case 'techno':
        return 'genre:techno OR genre:house OR genre:minimal';
      case 'festival':
        return 'genre:edm OR genre:"progressive house" OR genre:"big room"';
      case 'hiphop':
        return 'genre:hip-hop OR genre:rap OR genre:trap';
      case 'eclectic':
        return 'year:2020-2024'; // Recent tracks of any genre
    }
  };

  const selectTrackForAgent = (tracks: Track[], type: DJPersonaType, state: BattleState): Track => {
    // Filter based on agent preferences
    let filtered = tracks;
    
    switch (type) {
      case 'techno':
        filtered = tracks.filter(t => t.bpm >= 120 && t.bpm <= 135);
        break;
      case 'festival':
        filtered = tracks.filter(t => t.energy >= 7);
        break;
      case 'hiphop':
        filtered = tracks.filter(t => t.bpm >= 70 && t.bpm <= 100);
        break;
    }
    
    // Select best match (simplified)
    return filtered[0] || tracks[0];
  };

  const calculateTransitionScore = (fromTrack: Track, toTrack: Track): number => {
    let score = 0;
    
    // BPM compatibility
    const bpmDiff = Math.abs(fromTrack.bpm - toTrack.bpm);
    if (bpmDiff <= 5) score += 30;
    else if (bpmDiff <= 10) score += 20;
    else if (bpmDiff <= 15) score += 10;
    
    // Energy flow
    const energyDiff = Math.abs(fromTrack.energy - toTrack.energy);
    if (energyDiff <= 2) score += 20;
    else if (energyDiff <= 4) score += 10;
    
    // Bonus for creative transitions
    score += Math.floor(Math.random() * 20);
    
    return score;
  };

  const getTransitionTechnique = (type: DJPersonaType): string => {
    const techniques = {
      techno: ['Long Blend', 'EQ Sweep', 'Loop Roll'],
      festival: ['Drop Swap', 'Quick Cut', 'Build Transfer'],
      hiphop: ['Scratch Transition', 'Beat Juggle', 'Word Play'],
      eclectic: ['Genre Flip', 'Tempo Shift', 'Mashup'],
    };
    
    const agentTechniques = techniques[type];
    return agentTechniques[Math.floor(Math.random() * agentTechniques.length)];
  };

  const endBattle = () => {
    if (!battleState) return;
    
    const winner = battleState.agent1.score > battleState.agent2.score 
      ? battleState.agent1 
      : battleState.agent2;
    
    setBattleLog(prev => [...prev, 
      '🏁 Battle Complete!',
      `🏆 Winner: ${winner.name} with ${winner.score} points!`,
      `📊 Final Scores:`,
      `   ${battleState.agent1.name}: ${battleState.agent1.score}`,
      `   ${battleState.agent2.name}: ${battleState.agent2.score}`,
    ]);
    
    setBattleState(prev => prev ? { ...prev, isActive: false } : null);
  };

  if (!battleState) {
    return (
      <div style={{ 
        background: '#1a1a1a', 
        padding: '40px', 
        borderRadius: '12px',
        textAlign: 'center' 
      }}>
        <h2 style={{ marginBottom: '30px', fontSize: '32px' }}>🤖 Agent vs Agent Battle Mode 🤖</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ marginBottom: '20px' }}>Agent 1</h3>
            <select
              value={agent1Type}
              onChange={(e) => setAgent1Type(e.target.value as DJPersonaType)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '18px',
                background: '#2a2a2a',
                color: '#fff',
                border: '2px solid #444',
                borderRadius: '6px',
              }}
            >
              {Object.entries(DJ_PERSONAS_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.emoji} {info.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '20px' }}>Agent 2</h3>
            <select
              value={agent2Type}
              onChange={(e) => setAgent2Type(e.target.value as DJPersonaType)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '18px',
                background: '#2a2a2a',
                color: '#fff',
                border: '2px solid #444',
                borderRadius: '6px',
              }}
            >
              {Object.entries(DJ_PERSONAS_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.emoji} {info.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={startBattle}
          disabled={isLoading || agent1Type === agent2Type}
          className="button"
          style={{
            fontSize: '24px',
            padding: '20px 40px',
            background: agent1Type === agent2Type ? '#666' : '#ff0066',
          }}
        >
          {isLoading ? '🔄 Preparing Battle...' : '⚔️ Start Battle!'}
        </button>
        
        {agent1Type === agent2Type && (
          <p style={{ marginTop: '20px', color: '#ff6666' }}>
            Please select different DJ personas for the battle!
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={onBack}
        className="button"
        style={{ marginBottom: '20px' }}
      >
        ← Back to Mode Selection
      </button>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>⚔️ DJ Battle: Round {battleState.roundNumber}/5</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
          <div style={{ 
            padding: '15px 30px', 
            background: battleState.currentTurn === 'agent1' ? '#ff0066' : '#333',
            borderRadius: '8px',
          }}>
            <h3>{DJ_PERSONAS_INFO[battleState.agent1.type].emoji} {battleState.agent1.name}</h3>
            <p style={{ fontSize: '24px', marginTop: '10px' }}>Score: {battleState.agent1.score}</p>
          </div>
          
          <div style={{ alignSelf: 'center', fontSize: '32px' }}>VS</div>
          
          <div style={{ 
            padding: '15px 30px', 
            background: battleState.currentTurn === 'agent2' ? '#ff0066' : '#333',
            borderRadius: '8px',
          }}>
            <h3>{DJ_PERSONAS_INFO[battleState.agent2.type].emoji} {battleState.agent2.name}</h3>
            <p style={{ fontSize: '24px', marginTop: '10px' }}>Score: {battleState.agent2.score}</p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <DJDeck
          title={battleState.agent1.name}
          track={battleState.agent1.currentTrack}
          isPlaying={crossfaderPosition <= 50}
          onLoadTrack={() => {}}
          volume={100 - crossfaderPosition}
        />
        
        <DJDeck
          title={battleState.agent2.name}
          track={battleState.agent2.currentTrack}
          isPlaying={crossfaderPosition >= 50}
          onLoadTrack={() => {}}
          volume={crossfaderPosition}
        />
      </div>
      
      <Mixer
        crossfaderPosition={crossfaderPosition}
        onCrossfaderChange={setCrossfaderPosition}
      />
      
      {/* Battle Log */}
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
        <h3 style={{ marginBottom: '15px' }}>📜 Battle Log</h3>
        {battleLog.map((log, index) => (
          <p key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
            {log}
          </p>
        ))}
      </div>
      
      {/* Transition History */}
      {battleState.transitions.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
        }}>
          <h3 style={{ marginBottom: '15px' }}>🎯 Transitions</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {battleState.transitions.map((transition, index) => (
              <div key={index} style={{
                padding: '10px',
                background: '#2a2a2a',
                borderRadius: '6px',
                fontSize: '14px',
              }}>
                <strong>{transition.agent}</strong>: {transition.from} → {transition.to}
                <span style={{ float: 'right' }}>
                  {transition.technique} (+{transition.score} pts)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}