"use client";
import React, { useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";

const Toast = ({ open, message, severity = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
