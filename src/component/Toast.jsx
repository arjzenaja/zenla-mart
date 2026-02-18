'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { MdError } from 'react-icons/md'

const Toast = ({ 
  notification, 
  onClose,
  // Legacy props for backward compatibility
  open, 
  message, 
  severity, 
  duration 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const autoDismissTimerRef = useRef(null)
  const exitTimerRef = useRef(null)

  // Handle legacy props
  const notif = notification || {
    type: severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info',
    message: message || '',
    duration: duration || 3000,
  }

  // Entrance animation - trigger after component mounts
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Auto dismiss handler
  useEffect(() => {
    if (isVisible && !isExiting && !isHovered && notif.duration > 0) {
      autoDismissTimerRef.current = setTimeout(() => {
        handleClose()
      }, notif.duration)

      return () => {
        clearTimeout(autoDismissTimerRef.current)
      }
    }
  }, [isVisible, isExiting, isHovered, notif.duration])

  // Exit animation handler
  useEffect(() => {
    if (isExiting) {
      exitTimerRef.current = setTimeout(() => {
        onClose?.()
      }, 250) // Exit animation duration

      return () => clearTimeout(exitTimerRef.current)
    }
  }, [isExiting, onClose])

  const handleClose = () => {
    setIsExiting(true)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Don't render if exited
  if (!isVisible && isExiting) {
    return null
  }

  const getConfig = (type) => {
    const configs = {
      success: {
        icon: FiCheck,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-900',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        closeColor: 'text-emerald-500 hover:text-emerald-700',
      },
      error: {
        icon: MdError,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-900',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        closeColor: 'text-red-500 hover:text-red-700',
      },
      warning: {
        icon: FiAlertCircle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-900',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        closeColor: 'text-amber-500 hover:text-amber-700',
      },
      info: {
        icon: FiInfo,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        closeColor: 'text-blue-500 hover:text-blue-700',
      },
      loading: {
        icon: () => (
          <div className="inline-block">
            <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ),
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-900',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        closeColor: 'text-orange-500 hover:text-orange-700',
        isSpinner: true,
      },
    }

    return configs[type] || configs.info
  }

  const config = getConfig(notif.type)
  const Icon = config.icon
  const isSpinner = config.isSpinner

  // Sync visibility with legacy 'open' prop
  useEffect(() => {
    if (open !== undefined) {
      if (open) {
        setIsVisible(true)
        setIsExiting(false)
      } else {
        setIsExiting(true)
      }
    }
  }, [open])

  // Don't render component at all if no message and not loading
  if ((!notif.message && !isSpinner) || (!isVisible && isExiting)) {
    return null
  }

  return (
    <>
      <style>{`
        @keyframes toastSlideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toastSlideOutUp {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }

        .toast-enter {
          animation: toastSlideInDown 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .toast-exit {
          animation: toastSlideOutUp 250ms cubic-bezier(0.3, 0, 0.8, 0.15) forwards;
        }
      `}</style>

      <div
        className={`
          relative w-full mb-4
          ${isVisible && !isExiting ? 'toast-enter' : ''}
          ${!isVisible && isExiting ? 'toast-exit' : ''}
        `}
      >
        <div
          className={`
            relative
            flex items-start gap-4
            p-4
            rounded-2xl
            ${config.bgColor}
            border ${config.borderColor}
            shadow-sm
            overflow-hidden
            transition-all duration-300
          `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Icon Wrapper */}
          <div className={`
            flex items-center justify-center
            shrink-0
            w-10 h-10
            rounded-full
            ${config.iconBg}
          `}>
            {isSpinner ? (
              <div className={`${config.iconColor}`}>
                <Icon />
              </div>
            ) : (
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-2">
            <p className={`${config.textColor} font-medium text-sm leading-tight`}>
              {notif.message}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={handleClose}
            className={`
              shrink-0 p-1
              ${config.closeColor}
              transition-colors duration-200
              focus:outline-none
            `}
            aria-label="Close notification"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}

export default Toast
