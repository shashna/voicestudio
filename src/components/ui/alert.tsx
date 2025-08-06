"use client";

import * as React from "react";

export type AlertProps = React.HTMLAttributes<HTMLDivElement>;

export function Alert({ className = "", ...props }: AlertProps) {
  return <div role="alert" className={className} {...props} />;
}

export function AlertDescription({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={className} {...props} />;
}

export default Alert;
