import React, { useRef } from "react";

export default function AudioUploader({ onAudioUpload, disabled }) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onAudioUpload(e.target.files[0]);
    }
  };

  return (
    <div>
      <label>Upload Audio File:</label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={disabled}
        ref={fileInputRef}
      />
    </div>
  );
}
