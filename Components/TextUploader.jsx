import React, { useRef } from "react";

export default function TextUploader({ onTextUpload, disabled }) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onTextUpload(e.target.files[0], "file");
    }
  };

  const handleTextChange = (e) => {
    onTextUpload(e.target.value, "text");
  };

  return (
    <div>
      <label>Paste Text:</label>
      <textarea onBlur={handleTextChange} disabled={disabled}></textarea>
      <div>
        <label>Or upload a text file:</label>
        <input type="file" accept=".txt,.md,.docx,.pdf" onChange={handleFileChange} disabled={disabled} ref={fileInputRef} />
      </div>
    </div>
  );
}
