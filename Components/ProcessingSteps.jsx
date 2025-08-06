import React from "react";

export default function ProcessingSteps({ currentStep }) {
  const steps = [
    "Input",
    "Customize",
    "Preview & Export"
  ];

  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
      {steps.map((step, idx) => (
        <div key={idx} style={{
          padding: "0.5rem 1rem",
          background: currentStep === idx + 1 ? "#b4e" : "#eee",
          borderRadius: "8px"
        }}>
          {step}
        </div>
      ))}
    </div>
  );
}
