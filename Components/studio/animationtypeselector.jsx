import React from "react";

export default function AnimationTypeSelector({ selectedType, onTypeChange, disabled }) {
  return (
    <div>
      <label>Animation Type:</label>
      <select value={selectedType} onChange={e => onTypeChange(e.target.value)} disabled={disabled}>
        <option value="waveform">Waveform</option>
        <option value="static">Static</option>
        <option value="dynamic">Dynamic</option>
      </select>
    </div>
  );
}
