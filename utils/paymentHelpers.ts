/**
 * Payment Gateway Integration Helpers
 * VietQR, Stripe, PayPal payment methods
 */

// VietQR Configuration
const VIETQR_CONFIG = {
    bankId: '970422', // MB Bank (example - replace with actual)
    accountNo: '0123456789', // Replace with real account
    accountName: 'ADMIN PRO HVAC',
    template: 'compact2' // QR template type
};

export const vietQRHelper = {
    /**
     * Generate VietQR payment URL
     * @param orderId - Transaction ID
     * @param amount - Amount in VND
     * @returns QR code image URL
     */
    generateQRCode: (orderId: string, amount: number): string => {
        const { bankId, accountNo, accountName, template } = VIETQR_CONFIG;
        const description = `ADMINPRO ${orderId}`;

        // VietQRAPI URL format
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        return qrUrl;
    },

    /**
     * Verify payment transaction (webhook simulation)
     * In production, this should be a backend endpoint receiving webhooks from bank
     */
    verifyPayment: async (orderId: string, amount: number): Promise<boolean> => {
        // This is a placeholder - in production:
        // 1. Bank sends webhook to your backend when payment received
        // 2. Backend verifies transaction details
        // 3. Updates Firestore transaction status

        // For demo purposes, we'll simulate success after random delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.3; // 70% success rate for demo
                resolve(success);
            }, 2000);
        });
    }
};

export const stripeHelper = {
    /**
     * Create Stripe Checkout session
     * NOTE: This must be done on backend to keep API keys secure
     */
    createCheckoutSession: async (orderId: string, amount: number): Promise<string> => {
        // In production, call your backend API:
        // const response = await fetch('/api/stripe/create-checkout', {
        //   method: 'POST',
        //   body: JSON.stringify({ orderId, amount })
        // });
        // const { url } = await response.json();
        // return url;

        // For demo, return placeholder URL
        return `https://checkout.stripe.com/demo?amount=${amount}&order=${orderId}`;
    },

    /**
     * Handle Stripe webhook (backend only)
     */
    handleWebhook: async (event: any) => {
        // This should be a Cloud Function or backend endpoint
        // Stripe sends webhooks to verify payment success
        console.log('Stripe webhook received:', event);
    }
};

export const paypalHelper = {
    /**
     * Create PayPal order
     * NOTE: This must be done on backend for security
     */
    createOrder: async (orderId: string, amount: number): Promise<string> => {
        // In production:
        // const response = await fetch('/api/paypal/create-order', {
        //   method: 'POST',
        //   body: JSON.stringify({ orderId, amount: amount / 23000 }) // Convert VND to USD
        // });
        // const { approvalUrl } = await response.json();
        // return approvalUrl;

        // For demo
        return `https://www.paypal.com/checkoutnow?order=${orderId}&amount=${amount}`;
    },

    /**
     * Capture PayPal payment
     */
    capturePayment: async (paypalOrderId: string) => {
        // Backend API call to capture payment
        console.log('Capturing PayPal payment:', paypalOrderId);
    }
};

/**
 * Invoice Generation Helper
 */
export const invoiceHelper = {
    /**
     * Generate PDF invoice for completed transaction
     */
    generateInvoice: async (transaction: any): Promise<void> => {
        const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${transaction.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 3px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1a73e8; margin: 0; }
          .invoice-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
          .value { font-size: 16px; color: #333; margin-top: 5px; }
          .total { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: right; }
          .total-amount { font-size: 32px; color: #1a73e8; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HOÁ ĐƠN THANH TOÁN</h1>
          <p>Admin Pro HVAC Management System</p>
        </div>
        
        <div class="invoice-info">
          <div>
            <div class="label">Mã giao dịch</div>
            <div class="value">#${transaction.id}</div>
          </div>
          <div>
            <div class="label">Ngày tạo</div>
            <div class="value">${new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div class="label">Khách hàng</div>
            <div class="value">${transaction.userEmail || 'N/A'}</div>
          </div>
          <div>
            <div class="label">Phương thức</div>
            <div class="value">${transaction.paymentMethod || 'N/A'}</div>
          </div>
        </div>

        <div class="total">
          <div class="label">Tổng thanh toán</div>
          <div class="total-amount">${transaction.amount?.toLocaleString('vi-VN')}đ</div>
        </div>

        <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
          In hoá đơn
        </button>
      </body>
      </html>
    `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();
        }
    }
};
