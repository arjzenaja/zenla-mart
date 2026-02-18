"use client"
import React from "react";

export default function FormField({ label, required = false, children, error, className = "" }) {
  return (
    <div className={`form-field ${className}`}>
      {label ? (
        <label>
          {label}
          {required ? <span style={{ color: "var(--color-primary)", marginLeft: 6 }}>*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
