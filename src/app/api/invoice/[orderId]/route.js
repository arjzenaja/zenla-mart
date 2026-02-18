import { NextResponse } from 'next/server';

/**
 * GET /api/invoice/[orderId]
 * Returns invoice data for a specific order
 */
export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get API URL from environment
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    const cookies = request.headers.get('cookie') || '';

    // Fetch order data from backend
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        ...(cookies ? { 'Cookie': cookies } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch order');
    }

    const data = await response.json();
    const order = data.order || data;

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate invoice data
    const subtotal = order.subtotal || 0;
    const shippingCost = order.shippingCost || 0;
    const tax = 0; // Pajak dihapus
    const discount = order.discount || 0;
    const total = order.total || (subtotal + shippingCost - discount);

    // Format invoice number
    const invoiceNumber = `INV${order.orderNumber?.replace('ORD-', '') || order.id?.slice(-8) || Date.now().toString().slice(-8)}`;

    // Format invoice date
    const invoiceDate = order.createdAt 
      ? new Date(order.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

    // Prepare invoice items
    const invoiceItems = (order.items || []).map(item => ({
      description: item.productName || 'Product',
      variantName: item.variantName || '-',
      price: item.price || 0,
      quantity: item.quantity || 1,
      total: item.total || (item.price * item.quantity) || 0
    }));

    // Prepare customer data
    const customer = {
      name: order.address?.name || 'Customer',
      phone: order.address?.phone || '-',
      email: order.userEmail || '-',
      address: order.address 
        ? `${order.address.address}, ${order.address.city}, ${order.address.province} ${order.address.postalCode || ''}`
        : '-'
    };

    // Get payment method and details from order
    const rawPaymentMethod = (order.paymentMethod || '').toLowerCase()
    const paymentDetail = order.paymentDetail || order.selectedEwallet || null
    const paymentStatus = order.paymentStatus || 'pending'

    // Normalize payment method
    let normalizedPaymentMethod = rawPaymentMethod
    if (rawPaymentMethod === 'bank' || rawPaymentMethod === 'transfer' || rawPaymentMethod === 'bank_transfer') {
      normalizedPaymentMethod = 'BANK_TRANSFER'
    } else if (rawPaymentMethod === 'e-wallet' || rawPaymentMethod === 'ewallet') {
      normalizedPaymentMethod = 'EWALLET'
    } else if (rawPaymentMethod === 'cash' || rawPaymentMethod === 'cod') {
      normalizedPaymentMethod = 'COD'
    } else {
      // Default to bank transfer if unknown
      normalizedPaymentMethod = 'BANK_TRANSFER'
    }

    // Prepare payment info based on payment method
    let paymentInfo = null
    if (normalizedPaymentMethod === 'BANK_TRANSFER') {
      paymentInfo = {
        type: 'BANK_TRANSFER',
        bankName: 'Bank Mandiri',
        accountNumber: '0123 4567 8901',
        accountHolder: 'a.n ZenlaMart'
      }
    } else if (normalizedPaymentMethod === 'EWALLET') {
      const ewalletLabels = {
        'ovo': 'OVO',
        'gopay': 'GoPay',
        'linkaja': 'LinkAja'
      }
      paymentInfo = {
        type: 'EWALLET',
        ewalletName: ewalletLabels[paymentDetail?.toLowerCase()] || paymentDetail || 'E-Wallet',
        status: paymentStatus === 'paid' ? 'Sudah Dibayar' : 'Menunggu Pembayaran'
      }
    } else if (normalizedPaymentMethod === 'COD') {
      paymentInfo = {
        type: 'COD',
        label: 'Cash On Delivery (COD)',
        description: 'Bayar di tempat'
      }
    } else {
      // Default to bank transfer if unknown
      paymentInfo = {
        type: 'BANK_TRANSFER',
        bankName: 'Bank Mandiri',
        accountNumber: '0123 4567 8901',
        accountHolder: 'a.n ZenlaMart'
      }
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      orderNumber: order.orderNumber || order.id,
      orderDate: order.createdAt,
      customer,
      items: invoiceItems,
      subtotal,
      shipping: shippingCost,
      tax,
      discount,
      total,
      paymentMethod: normalizedPaymentMethod,
      paymentDetail: paymentDetail,
      paymentStatus: paymentStatus,
      paymentInfo: paymentInfo,
      storeInfo: {
        name: 'ZenlaMart Grocery Market',
        phone: '+123-456-7890',
        email: 'hello@reallygreatsite.com',
        website: 'www.reallygreatsite.com'
      }
    };

    return NextResponse.json({
      success: true,
      invoice: invoiceData
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
