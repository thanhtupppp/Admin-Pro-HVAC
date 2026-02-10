/**
 * Unit Tests for invoiceHelpers.ts
 * Testing PDF and HTML invoice generation
 */

// Complete jsPDF mock with all required methods
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn().mockReturnThis(),
    setTextColor: jest.fn().mockReturnThis(),
    setDrawColor: jest.fn().mockReturnThis(),
    setFillColor: jest.fn().mockReturnThis(),
    setFont: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    line: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    save: jest.fn(),
    internal: {
      pageSize: { getWidth: () => 210, getHeight: () => 297 }
    }
  }))
}));

import { generateInvoicePDF, generateInvoiceHTML } from '../../utils/invoiceHelpers';

// Define interfaces locally since they're not exported
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

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

describe('invoiceHelpers', () => {
  
  // Sample invoice data for tests
  const sampleInvoiceData: InvoiceData = {
    invoiceNumber: 'INV-2024-001',
    date: '2024-02-06',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'customer@example.com',
    customerAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
    items: [
      { description: 'Gói Premium 1 tháng', quantity: 1, unitPrice: 99000, total: 99000 },
      { description: 'Phí dịch vụ bổ sung', quantity: 2, unitPrice: 25000, total: 50000 }
    ],
    subtotal: 149000,
    discount: 10000,
    tax: 14900,
    total: 153900,
    paymentMethod: 'VietQR',
    notes: 'Cảm ơn quý khách'
  };

  // ==========================================
  // generateInvoicePDF tests
  // ==========================================
  describe('generateInvoicePDF', () => {
    const { jsPDF } = require('jspdf');

    beforeEach(() => {
      jsPDF.mockClear();
    });

    it('should create new jsPDF instance', () => {
      generateInvoicePDF(sampleInvoiceData);
      expect(jsPDF).toHaveBeenCalled();
    });

    it('should call save with invoice filename', () => {
      const mockSave = jest.fn();
      jsPDF.mockImplementation(() => ({
        setFontSize: jest.fn().mockReturnThis(),
        setTextColor: jest.fn().mockReturnThis(),
        setDrawColor: jest.fn().mockReturnThis(),
        setFillColor: jest.fn().mockReturnThis(),
        setFont: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        line: jest.fn().mockReturnThis(),
        rect: jest.fn().mockReturnThis(),
        save: mockSave,
        internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
      }));

      generateInvoicePDF(sampleInvoiceData);

      expect(mockSave).toHaveBeenCalledWith(expect.stringContaining('INV-2024-001'));
    });

    it('should handle invoice without optional fields', () => {
      const minimalData: InvoiceData = {
        invoiceNumber: 'INV-001',
        date: '2024-01-01',
        customerName: 'Test Customer',
        items: [],
        subtotal: 0,
        total: 0,
        paymentMethod: 'Cash'
      };

      expect(() => generateInvoicePDF(minimalData)).not.toThrow();
    });
  });

  // ==========================================
  // generateInvoiceHTML tests
  // ==========================================
  describe('generateInvoiceHTML', () => {
    const mockDocumentWrite = jest.fn();
    const mockDocumentClose = jest.fn();
    const mockPrint = jest.fn();
    const mockFocus = jest.fn();
    let mockWindowOpen: jest.SpyInstance;

    beforeEach(() => {
      mockDocumentWrite.mockClear();
      mockDocumentClose.mockClear();
      mockPrint.mockClear();
      mockFocus.mockClear();

      mockWindowOpen = jest.spyOn(window, 'open').mockReturnValue({
        document: {
          write: mockDocumentWrite,
          close: mockDocumentClose
        },
        print: mockPrint,
        focus: mockFocus,
        onload: null
      } as unknown as Window);
    });

    afterEach(() => {
      mockWindowOpen.mockRestore();
    });

    it('should open new window for invoice', () => {
      generateInvoiceHTML(sampleInvoiceData);

      expect(mockWindowOpen).toHaveBeenCalled();
      expect(mockWindowOpen.mock.calls[0][0]).toBe(''); // First arg: empty URL
    });

    it('should write HTML content to window', () => {
      generateInvoiceHTML(sampleInvoiceData);

      expect(mockDocumentWrite).toHaveBeenCalled();
      const htmlContent = mockDocumentWrite.mock.calls[0][0];
      expect(htmlContent).toContain('<!DOCTYPE html>');
    });

    it('should include invoice number in HTML', () => {
      generateInvoiceHTML(sampleInvoiceData);

      const htmlContent = mockDocumentWrite.mock.calls[0][0];
      expect(htmlContent).toContain('INV-2024-001');
    });

    it('should include customer name', () => {
      generateInvoiceHTML(sampleInvoiceData);

      const htmlContent = mockDocumentWrite.mock.calls[0][0];
      expect(htmlContent).toContain('Nguyễn Văn A');
    });

    it('should handle null window.open gracefully', () => {
      mockWindowOpen.mockReturnValue(null);

      expect(() => generateInvoiceHTML(sampleInvoiceData)).not.toThrow();
    });

    it('should handle empty items array', () => {
      const emptyItemsData: InvoiceData = {
        ...sampleInvoiceData,
        items: []
      };

      expect(() => generateInvoiceHTML(emptyItemsData)).not.toThrow();
    });
  });
});
