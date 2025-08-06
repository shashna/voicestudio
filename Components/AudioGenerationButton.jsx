import React from "react";

export default function AudioGenerationButton({ text }) {
  async function generateAndPlayAudio() {
    if (!text) {
      alert("No text to generate audio.");
      return;
    }
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();

        // Uncomment below to auto-download:
        // const link = document.createElement('a');
        // link.href = audioUrl;
        // link.download = "speech.mp3";
        // link.click();
      } else {
        alert("Audio generation failed");
      }
    } catch (err) {
      alert("An error occurred: " + err.message);
    }
  }

  return (
    <button
      onClick={generateAndPlayAudio}
      disabled={!text}
      style={{
        padding: "8px 20px",
        margin: "8px",
        background: "#4a23dd",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: text ? "pointer" : "not-allowed",
        opacity: text ? 1 : 0.5
      }}
    >
      Generate Real Audio
    </button>
  );
}
