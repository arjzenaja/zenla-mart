/**
 * Format currency to Indonesian Rupiah (Rp)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "Rp 25.000")
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Rp 0';
  
  // Format dengan titik sebagai pemisah ribuan, tanpa desimal untuk Rupiah
  const formatted = Math.round(numAmount).toLocaleString('id-ID');
  return `Rp ${formatted}`;
};
