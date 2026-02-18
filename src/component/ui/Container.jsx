"use client"
import React from "react";

export default function Container({ children, className = "" }) {
  return <div className={`app-container ${className}`}>{children}</div>;
}
