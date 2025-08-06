import React from "react";

export default function AnimationPreview({ project }) {
  return (
    <div>
      <h3>Preview</h3>
      {project.cover_image_url && <img src={project.cover_image_url} alt="Cover" style={{maxWidth: "100%"}} />}
      {project.animation_video_url && (
        <video controls src={project.animation_video_url} style={{maxWidth: "100%"}} />
      )}
      <div>Audio: {project.generated_audio_url}</div>
      <div>Status: {project.status}</div>
    </div>
  );
}
