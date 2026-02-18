'use client';

import { useEffect } from 'react';

export default function ErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections (HMR ping errors)
    const handleUnhandledRejection = (event) => {
      const error = event.reason;
      
      // Suppress HMR ping errors
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('unrecognized HMR message')
      ) {
        event.preventDefault();
        // Silently ignore HMR ping errors
        return;
      }
    };

    // Handle general errors
    const handleError = (event) => {
      const error = event.error;
      
      // Suppress HMR ping errors
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('unrecognized HMR message')
      ) {
        event.preventDefault();
        // Silently ignore HMR ping errors
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
