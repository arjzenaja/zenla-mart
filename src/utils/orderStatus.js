/**
 * Order Status Translation and Utilities
 * Maps English status to Indonesian labels
 */

export const STATUS_TRANSLATION = {
  'pending': 'Menunggu Pembayaran',
  'processing': 'Diproses',
  'shipped': 'Dikirim',
  'delivered': 'Selesai',
  'cancelled': 'Dibatalkan'
};

export const STATUS_COLORS = {
  'pending': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  'processing': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  'shipped': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  'delivered': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  'cancelled': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300'
  }
};

/**
 * Get Indonesian status label
 */
export const getStatusLabel = (status) => {
  if (!status) return 'Tidak Diketahui';
  return STATUS_TRANSLATION[status.toLowerCase()] || status;
};

/**
 * Get status colors
 */
export const getStatusColors = (status) => {
  if (!status) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300'
    };
  }
  return STATUS_COLORS[status.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300'
  };
};
