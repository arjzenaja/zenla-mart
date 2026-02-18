export const generateInvoiceHTML = (order) => {
  const date = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const itemsHtml = order.items.map(item => `
    <tr>
      <td>
        <div class="product-info">
          <img src="${item.productImage}" alt="${item.productName}" onerror="this.src='https://via.placeholder.com/50'"/>
          <div>
            <div class="product-name">${item.productName}</div>
            <div class="product-variant">${item.variantName || ''}</div>
          </div>
        </div>
      </td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">Rp ${item.price.toLocaleString('id-ID')}</td>
      <td style="text-align: right;">Rp ${item.total.toLocaleString('id-ID')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${order.invoiceNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #D96F32; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #D96F32; }
        .invoice-info { text-align: right; }
        .invoice-info h1 { margin: 0; color: #D96F32; font-size: 24px; }
        
        .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .details-column { flex: 1; }
        .details-title { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #f8f9fa; color: #666; font-size: 12px; text-transform: uppercase; padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        td { padding: 15px 12px; border-bottom: 1px solid #eee; }
        
        .product-info { display: flex; align-items: center; gap: 15px; }
        .product-info img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
        .product-name { font-weight: 600; font-size: 14px; }
        .product-variant { font-size: 12px; color: #888; margin-top: 2px; }
        
        .totals { margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row.grand-total { border-top: 2px solid #D96F32; margin-top: 10px; padding-top: 15px; font-weight: bold; font-size: 18px; color: #D96F32; }
        
        .footer { margin-top: 60px; text-align: center; color: #aaa; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        .status-paid { color: #10B981; font-weight: bold; text-transform: uppercase; }
        .status-unpaid { color: #F59E0B; font-weight: bold; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ZENLA MART</div>
        <div class="invoice-info">
          <h1>INVOICE</h1>
          <div>#${order.invoiceNumber}</div>
          <div style="margin-top: 5px;">${date}</div>
          <div style="margin-top: 5px;" class="${order.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
            ${order.paymentStatus === 'paid' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
          </div>
        </div>
      </div>
      
      <div class="details">
        <div class="details-column">
          <div class="details-title">Pembeli</div>
          <div style="font-weight: 600;">${order.address.name}</div>
          <div>${order.address.phone}</div>
          <div style="margin-top: 5px; color: #666; max-width: 250px;">
            ${order.address.address},<br>
            ${order.address.city}, ${order.address.province} ${order.address.postalCode}
          </div>
        </div>
        <div class="details-column" style="text-align: right;">
          <div class="details-title">Metode Pembayaran</div>
          <div style="font-weight: 600; text-transform: uppercase;">${order.paymentMethod}</div>
          <div class="details-title" style="margin-top: 20px;">Metode Pengiriman</div>
          <div style="font-weight: 600; text-transform: uppercase;">${order.shippingMethod}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Produk</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Harga</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>Rp ${order.subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div class="total-row">
          <span>Ongkos Kirim</span>
          <span>Rp ${order.shippingCost.toLocaleString('id-ID')}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total</span>
          <span>Rp ${order.total.toLocaleString('id-ID')}</span>
        </div>
      </div>
      
      <div class="footer">
        Terima kasih telah berbelanja di Zenla Mart!<br>
        Jika ada pertanyaan silakan hubungi customer service kami.
      </div>
    </body>
    </html>
  `;
};
