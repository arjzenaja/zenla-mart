"use client";
import React, { useEffect, useRef } from "react";

const DeleteConfirmModal = ({ open, title, description, onCancel, onConfirm, isLoading }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative bg-[#231717] text-white rounded-xl shadow-xl w-[min(720px,90%)] p-6">
        <button
          onClick={onCancel}
          aria-label="close"
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
        >
          ✕
        </button>

        <div className="flex items-start gap-4">
          <div className="text-4xl text-yellow-300">⚠️</div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-200 mb-4">{description}</p>

            <div className="flex justify-end gap-3">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-200 bg-transparent hover:bg-white/5 focus:outline-none"
              >
                Batal
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md bg-red-600 text-white font-medium disabled:opacity-60 flex items-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <span className="loader-border w-4 h-4 inline-block rounded-full border-2 border-white/90 border-t-transparent animate-spin"></span>
                    Menghapus...
                  </>
                ) : (
                  <>🗑️ Hapus</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
