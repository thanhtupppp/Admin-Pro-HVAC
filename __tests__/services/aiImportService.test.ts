/**
 * Unit Tests for aiImportService.ts
 * Tests AI-powered data extraction from images
 */

import { aiImportService } from '../../services/aiImportService';

describe('aiImportService', () => {
  // ==========================================
  // parseAIResponse tests (pure function)
  // ==========================================
  describe('parseAIResponse', () => {
    it('should parse valid JSON directly', () => {
      const json = JSON.stringify({ fields: { test: { label: 'Test', value: 'Value', confidence: 0.9 } } });
      const result = aiImportService.parseAIResponse(json);

      expect(result).not.toBeNull();
      expect(result?.fields.test.label).toBe('Test');
    });

    it('should extract JSON from markdown code blocks', () => {
      const response = '```json\n{"fields": {"code": {"label": "Code", "value": "E01", "confidence": 0.95}}}\n```';
      const result = aiImportService.parseAIResponse(response);

      expect(result).not.toBeNull();
      expect(result?.fields.code.value).toBe('E01');
    });

    it('should extract JSON object from text', () => {
      const response = 'Here is the data: {"fields": {"brand": {"label": "Brand", "value": "Daikin", "confidence": 0.9}}}';
      const result = aiImportService.parseAIResponse(response);

      expect(result).not.toBeNull();
      expect(result?.fields.brand.value).toBe('Daikin');
    });

    it('should return null for invalid response', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = aiImportService.parseAIResponse('invalid data');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // extractFromImage tests
  // ==========================================
  describe('extractFromImage', () => {
    it('should return mock extracted data', async () => {
      jest.useFakeTimers();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const promise = aiImportService.extractFromImage(file);
      jest.runAllTimers();

      const result = await promise;

      expect(result).toHaveProperty('fields');
      expect(result.fields).toHaveProperty('errorCode');
      jest.useRealTimers();
    });
  });
});
