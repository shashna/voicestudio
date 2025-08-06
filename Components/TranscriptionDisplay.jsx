import React from "react";

export default function TranscriptionDisplay({ transcription, onTranscriptionChange }) {
  return (
    <div>
      <label>Transcribed Text:</label>
      <textarea
        value={transcription}
        onChange={e => onTranscriptionChange(e.target.value)}
      />
    </div>
  );
}
