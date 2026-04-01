const getPaymentMethods = async (req, res, next) => {
  try {
    // Hardcoded payment methods to match Web Client's checkout page
    const paymentMethods = [
       { 
         id: 'cash', 
         name: 'Bayar di Tempat (COD)', 
         icon: 'cash', 
         description: 'Bayar langsung ke kurir ketika pesanan sampai di alamatmu.',
         requiresProof: false
       },
       { 
         id: 'bank', 
         name: 'Transfer Bank', 
         icon: 'bank', 
         description: 'Pembayaran via transfer ke rekening virtual account atau rekening bersama.',
         requiresProof: true
       },
       { 
         id: 'e-wallet', 
         name: 'E-Wallet', 
         icon: 'wallet', 
         description: 'Pembayaran via OVO, GoPay, atau LinkAja.',
         requiresProof: true,
         options: [
           { id: 'ovo', label: 'OVO' },
           { id: 'gopay', label: 'GoPay' },
           { id: 'linkaja', label: 'LinkAja' }
         ]
       }
    ];
    
    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPaymentMethods };
