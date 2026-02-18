'use client'
import React, { useState, useCallback, createContext } from 'react'
import { NotificationContext } from './NotificationContext'
import Toast from '@/component/Toast'

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = {
      id,
      type: 'info',
      duration: 3500,
      ...notification,
    }

    setNotifications((prev) => {
      // Max 3 concurrent notifications
      const updated = [...prev, newNotification]
      if (updated.length > 3) {
        return updated.slice(-3)
      }
      return updated
    })

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const showSuccess = useCallback(
    (message, duration = 3500) => {
      return addNotification({
        type: 'success',
        message,
        duration,
      })
    },
    [addNotification]
  )

  const showError = useCallback(
    (message, duration = 3500) => {
      return addNotification({
        type: 'error',
        message,
        duration,
      })
    },
    [addNotification]
  )

  const showWarning = useCallback(
    (message, duration = 3500) => {
      return addNotification({
        type: 'warning',
        message,
        duration,
      })
    },
    [addNotification]
  )

  const showInfo = useCallback(
    (message, duration = 3500) => {
      return addNotification({
        type: 'info',
        message,
        duration,
      })
    },
    [addNotification]
  )

  const showLoading = useCallback(
    (message, duration = 0) => {
      return addNotification({
        type: 'loading',
        message,
        duration,
      })
    },
    [addNotification]
  )

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <style>{`
        @media (max-width: 768px) {
          .toast-container {
            top: 1rem;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
          }
        }

        @media (min-width: 769px) {
          .toast-container {
            top: 1.5rem;
            right: 1.5rem;
            left: auto;
          }
        }
      `}</style>

      <div className="toast-container fixed z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
          >
            <Toast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
