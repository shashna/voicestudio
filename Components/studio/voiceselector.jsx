import React from "react";

export default function VoiceSelector({ selectedVoice, selectedStyle, onVoiceChange, onStyleChange, disabled }) {
  return (
    <div>
      <label>Voice Type:</label>
      <select value={selectedVoice} onChange={e => onVoiceChange(e.target.value)} disabled={disabled}>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>
      <label>Visual Style:</label>
      <select value={selectedStyle} onChange={e => onStyleChange(e.target.value)} disabled={disabled}>
        <option value="abstract">Abstract</option>
        <option value="realistic">Realistic</option>
        <option value="cartoon">Cartoon</option>
      </select>
    </div>
  );
}
