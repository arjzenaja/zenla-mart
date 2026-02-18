"use client"
import React from "react";

export default function ModalConfirm({
  open,
  title = "Confirm",
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  cancelDisabled = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {message ? <p>{message}</p> : null}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn" onClick={onCancel} disabled={cancelDisabled || loading}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg className="spinner" viewBox="0 0 50 50" width={16} height={16}>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#eee" strokeWidth="6" strokeLinecap="round" />
                  <path d="M45 25a20 20 0 0 0-5-12" stroke="var(--color-primary)" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
