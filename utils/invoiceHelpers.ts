/**
 * Invoice PDF Generation Utilities
 */

import { jsPDF } from 'jspdf';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerEmail?: string;
    customerAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
    paymentMethod: string;
    notes?: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

/**
 * Generate Invoice PDF using jsPDF
 */
export const generateInvoicePDF = (data: InvoiceData): void => {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ADMIN PRO HVAC', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional HVAC Management System', 105, 27, { align: 'center' });
    doc.text('Email: contact@adminprohvac.com | Phone: +84 123 456 789', 105, 32, { align: 'center' });

    // Invoice Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HÓA ĐƠN / INVOICE', 105, 45, { align: 'center' });

    // Invoice Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${data.invoiceNumber}`, 20, 60);
    doc.text(`Date: ${data.date}`, 20, 67);

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerName, 20, 87);
    if (data.customerEmail) {
        doc.text(data.customerEmail, 20, 94);
    }
    if (data.customerAddress) {
        doc.text(data.customerAddress, 20, 101);
    }

    // Items Table
    let yPos = 120;

    // Table Header
    doc.setFillColor(41, 128, 185);
    doc.rect(20, yPos, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 22, yPos + 5);
    doc.text('Qty', 130, yPos + 5);
    doc.text('Price', 150, yPos + 5);
    doc.text('Total', 175, yPos + 5);

    // Table Items
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    yPos += 10;

    data.items.forEach((item) => {
        doc.text(item.description, 22, yPos);
        doc.text(item.quantity.toString(), 130, yPos);
        doc.text(item.unitPrice.toLocaleString('vi-VN'), 150, yPos);
        doc.text(item.total.toLocaleString('vi-VN'), 175, yPos);
        yPos += 7;
    });

    // Totals
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 130, yPos);
    doc.text(`${data.subtotal.toLocaleString('vi-VN')}đ`, 175, yPos, { align: 'right' });

    if (data.discount) {
        yPos += 7;
        doc.text('Discount:', 130, yPos);
        doc.text(`-${data.discount.toLocaleString('vi-VN')}đ`, 175, yPos, { align: 'right' });
    }

    if (data.tax) {
        yPos += 7;
        doc.text('Tax:', 130, yPos);
        doc.text(`${data.tax.toLocaleString('vi-VN')}đ`, 175, yPos, { align: 'right' });
    }

    // Grand Total
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 130, yPos);
    doc.text(`${data.total.toLocaleString('vi-VN')}đ`, 175, yPos, { align: 'right' });

    // Payment Method
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${data.paymentMethod}`, 20, yPos);

    // Notes
    if (data.notes) {
        yPos += 10;
        doc.setFont('helvetica', 'italic');
        doc.text('Notes:', 20, yPos);
        doc.text(data.notes, 20, yPos + 7);
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a signature.', 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`invoice-${data.invoiceNumber}.pdf`);
};

/**
 * Generate Invoice using HTML + Print (Alternative - No library needed)
 */
export const generateInvoiceHTML = (data: InvoiceData): void => {
    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          background: white;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2980b9;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 32px;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .header p {
          color: #7f8c8d;
          font-size: 14px;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
        }
        .invoice-info div {
          flex: 1;
        }
        .invoice-info h3 {
          color: #2980b9;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .invoice-info p {
          margin: 5px 0;
          color: #555;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        thead {
          background: #2980b9;
          color: white;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }
        th {
          font-weight: 600;
        }
        td {
          color: #555;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-top: 30px;
          float: right;
          width: 300px;
        }
        .totals .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ecf0f1;
        }
        .totals .row.total {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          border-top: 2px solid #2980b9;
          border-bottom: 3px double #2980b9;
          margin-top: 10px;
        }
        .footer {
          clear: both;
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
          text-align: center;
          color: #7f8c8d;
          font-size: 12px;
        }
        .payment-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ADMIN PRO HVAC</h1>
        <p>Professional HVAC Management System</p>
        <p>Email: contact@adminprohvac.com | Phone: +84 123 456 789</p>
      </div>

      <h2 style="text-align: center; color: #2980b9; margin: 20px 0;">HÓA ĐƠN / INVOICE</h2>

      <div class="invoice-info">
        <div>
          <h3>Invoice Details</h3>
          <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
          <p><strong>Date:</strong> ${data.date}</p>
        </div>
        <div>
          <h3>Bill To</h3>
          <p><strong>${data.customerName}</strong></p>
          ${data.customerEmail ? `<p>${data.customerEmail}</p>` : ''}
          ${data.customerAddress ? `<p>${data.customerAddress}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${item.unitPrice.toLocaleString('vi-VN')}đ</td>
              <td class="text-right">${item.total.toLocaleString('vi-VN')}đ</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="row">
          <span>Subtotal:</span>
          <span>${data.subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        ${data.discount ? `
          <div class="row">
            <span>Discount:</span>
            <span>-${data.discount.toLocaleString('vi-VN')}đ</span>
          </div>
        ` : ''}
        ${data.tax ? `
          <div class="row">
            <span>Tax:</span>
            <span>${data.tax.toLocaleString('vi-VN')}đ</span>
          </div>
        ` : ''}
        <div class="row total">
          <span>TOTAL:</span>
          <span>${data.total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      <div class="payment-info" style="clear: both;">
        <strong>Payment Method:</strong> ${data.paymentMethod}
      </div>

      ${data.notes ? `
        <div style="margin: 20px 0;">
          <strong>Notes:</strong>
          <p style="margin-top: 5px; color: #666;">${data.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </body>
    </html>
  `;

    // Open in new window and print
    const printWindow = window.open('', '', 'width=900,height=800');
    if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = () => {
            printWindow.print();
        };
    }
};
