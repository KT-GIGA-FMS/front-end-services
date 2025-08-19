export default function PlaybackControls({ isPlaying, onPlay, onPause, onReset, speed, setSpeed }) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
        {!isPlaying ? <button onClick={onPlay}>▶ Play</button> : <button onClick={onPause}>⏸ Pause</button>}
        <button onClick={onReset}>⏮ Reset</button>
        <label>
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </label>
      </div>
    );
  }
  