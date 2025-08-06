"use client";

import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className = "", ...props }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-200 rounded ${className}`} {...props}>
      <div className="h-2 bg-blue-500 rounded" style={{ width: `${value}%` }} />
    </div>
  );
}

export default Progress;
