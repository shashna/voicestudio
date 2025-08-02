import React from "react";

export default function MicrophoneRecorder({ onRecordingComplete, disabled }) {
  // Dummy implementation, you can later add real recording logic
  return (
    <div>
      <button disabled={disabled} onClick={() => {
        // For demo: return a dummy blob
        const blob = new Blob([], { type: "audio/wav" });
        onRecordingComplete(blob);
      }}>
        Record (Dummy)
      </button>
    </div>
  );
}
