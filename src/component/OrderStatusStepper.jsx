import React from 'react'
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiHome } from 'react-icons/fi'

const OrderStatusStepper = ({ status, isPickup = false }) => {
  const statusMap = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    // Pickup specific mappings
    ready_for_pickup: 2,
    picked_up: 3,
    // Legacy support (if needed)
    ready: 2,
    completed: 3,
  }

  // Handle mapping for mixed statuses if backend isn't changed yet
  let currentStatus = status?.toLowerCase()
  
  if (isPickup) {
    // Legacy status mapping if needed
    if (currentStatus === 'shipped') currentStatus = 'ready_for_pickup'
    if (currentStatus === 'delivered') currentStatus = 'picked_up'
  }

  const currentIndex = statusMap[currentStatus] ?? 0

  const deliverySteps = [
    {
      key: 'created',
      label: 'Pesanan Dibuat',
      description: 'Order berhasil diterima sistem.',
      icon: FiCheckCircle,
      color: 'from-green-400 to-emerald-500',
    },
    {
      key: 'processing',
      label: 'Diproses',
      description: 'Penjual sedang menyiapkan pesanan.',
      icon: FiPackage,
      color: 'from-blue-400 to-cyan-500',
    },
    {
      key: 'shipped',
      label: 'Dikirim',
      description: 'Pesanan sedang dalam perjalanan.',
      icon: FiTruck,
      color: 'from-purple-400 to-pink-500',
    },
    {
      key: 'delivered',
      label: 'Diterima',
      description: 'Pesanan telah sampai ke tujuan.',
      icon: FiHome,
      color: 'from-orange-400 to-red-500',
    },
  ]

  const pickupSteps = [
    {
      key: 'created',
      label: 'Pesanan Dibuat',
      description: 'Order berhasil diterima sistem.',
      icon: FiCheckCircle,
      color: 'from-green-400 to-emerald-500',
    },
    {
      key: 'processing',
      label: 'Diproses',
      description: 'Penjual sedang menyiapkan pesanan.',
      icon: FiPackage,
      color: 'from-blue-400 to-cyan-500',
    },
    {
      key: 'ready_for_pickup',
      label: 'Siap Diambil',
      description: 'Pesanan dapat diambil di toko.',
      icon: FiHome,
      color: 'from-purple-400 to-pink-500',
    },
    {
      key: 'picked_up',
      label: 'Selesai',
      description: 'Pesanan telah diambil.',
      icon: FiCheckCircle,
      color: 'from-orange-400 to-red-500',
    },
  ]

  const steps = isPickup ? pickupSteps : deliverySteps

  return (
    <div className="w-full">
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-7 left-0 right-0 h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full z-0 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex
            const isPast = index < currentIndex

            return (
              <div 
                key={step.key} 
                className="flex flex-col items-center flex-1 relative z-10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Circle Container with Pulse Effect */}
                <div className="relative">
                  {/* Pulse Ring for Current Step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-primary opacity-20 pulse-ring" />
                  )}
                  
                  {/* Step Circle */}
                  <div
                    className={`
                      flex items-center justify-center w-14 h-14 rounded-full border-[3px] 
                      transition-all duration-500 transform
                      ${isCompleted
                        ? `bg-gradient-to-br ${step.color} border-transparent text-white shadow-lg hover:scale-110 hover:shadow-xl cursor-pointer`
                        : 'bg-white border-gray-300 text-gray-400 shadow-md'
                      }
                      ${isCurrent ? 'scale-110 shadow-2xl' : ''}
                    `}
                  >
                    {isPast ? (
                      <FiCheckCircle size={26} className="text-white drop-shadow-md" />
                    ) : (
                      <Icon
                        size={26}
                        className={`${isCurrent ? 'text-white drop-shadow-md' : 'text-gray-400'} transition-all duration-300`}
                      />
                    )}
                  </div>

                  {/* Glow Effect for Current Step */}
                  {isCurrent && (
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-30 blur-md -z-10`} />
                  )}
                </div>

                {/* Step Label & Description */}
                <div className="mt-4 text-center max-w-[130px] transition-all duration-300">
                  <p
                    className={`
                      text-sm font-[700] mb-1.5 transition-all duration-300
                      ${isCurrent
                        ? 'text-primary scale-105'
                        : isCompleted
                        ? 'text-gray-800'
                        : 'text-gray-500'
                      }
                    `}
                  >
                    {step.label}
                  </p>
                  <p className={`
                    text-xs leading-tight transition-colors duration-300
                    ${isCurrent ? 'text-gray-700 font-medium' : 'text-gray-500'}
                  `}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Pickup Info Alert */}
      {isPickup && currentIndex >= 2 && currentIndex < 3 && (
        <div className="mt-8 mx-auto max-w-lg bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in-up">
          <div className="p-2 bg-blue-100 rounded-full">
            <FiHome className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Pesanan Siap Diambil</p>
            <p className="text-xs text-blue-800">Silakan datang ke toko untuk mengambil pesanan Anda.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStatusStepper
