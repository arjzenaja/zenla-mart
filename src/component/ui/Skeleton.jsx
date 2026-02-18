"use client"
import React from "react";

export default function Skeleton({ height = "16px", width = "100%", style = {} }) {
  return <div className="skeleton" style={{ height, width, ...style }} />;
}
