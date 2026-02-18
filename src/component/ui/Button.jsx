"use client"
import React from "react";
import Spinner from "./Spinner";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  full = false,
  className = "",
  // Filter out MUI-specific props that shouldn't reach the DOM
  startIcon,
  endIcon,
  size,
  color,
  ...props
}) {
  const classes = ["btn"];
  if (variant === "primary") classes.push("btn-primary");
  if (full) classes.push("btn-full");
  if (disabled || loading) classes.push("btn-disabled");
  if (className) classes.push(className);

  return (
    <button
      className={classes.join(" ")}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={18} /> : null}
      <span style={{ marginLeft: loading ? 8 : 0 }}>{children}</span>
    </button>
  );
}
