interface MixerProps {
  crossfaderPosition: number;
  onCrossfaderChange: (position: number) => void;
}

export function Mixer({ crossfaderPosition, onCrossfaderChange }: MixerProps) {
  return (
    <div className="mixer">
      <span>Human DJ</span>
      <input
        type="range"
        min="0"
        max="100"
        value={crossfaderPosition}
        onChange={(e) => onCrossfaderChange(parseInt(e.target.value))}
        className="crossfader"
      />
      <span>AI DJ</span>
    </div>
  );
}