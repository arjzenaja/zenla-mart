"use client"
import React from "react";

export default function Spinner({ size = 20 }) {
  return (
    <svg
      className="spinner"
      viewBox="0 0 50 50"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="25" cy="25" r="20" fill="none" stroke="#eee" strokeWidth="6" strokeLinecap="round" />
      <path d="M45 25a20 20 0 0 0-5-12" stroke="var(--color-primary)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
