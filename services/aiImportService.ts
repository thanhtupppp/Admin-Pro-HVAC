/**
 * AI Import Service
 * Handles AI-powered data extraction from images and documents
 */

export interface ExtractedField {
    label: string;
    value: string;
    confidence: number;
}

export interface BoundingBox {
    field: string;
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
}

export interface ExtractedData {
    fields: Record<string, ExtractedField>;
    boundingBoxes?: BoundingBox[];
    rawText?: string;
}

export const aiImportService = {
    /**
     * Extract data from image using AI (Gemini Vision)
     */
    extractFromImage: async (file: File): Promise<ExtractedData> => {
        // In production, this would:
        // 1. Upload image to Firebase Storage
        // 2. Call Gemini 2.0 Flash with vision capabilities
        // 3. Parse structured JSON response
        // 4. Return extracted fields with confidence scores

        // For demo, simulate AI processing with delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock extracted data (in production, this comes from Gemini API)
        const mockData: ExtractedData = {
            fields: {
                errorCode: {
                    label: 'Mã lỗi',
                    value: 'E-301',
                    confidence: 0.95
                },
                brand: {
                    label: 'Hãng',
                    value: 'Daikin',
                    confidence: 0.92
                },
                model: {
                    label: 'Model',
                    value: 'FTK-25AV1V',
                    confidence: 0.88
                },
                diagnosis: {
                    label: 'Chẩn đoán',
                    value: 'Lỗi cảm biến nhiệt độ phòng',
                    confidence: 0.85
                },
                solution: {
                    label: 'Giải pháp',
                    value: 'Kiểm tra kết nối cảm biến, thay thế nếu cần',
                    confidence: 0.78
                }
            },
            boundingBoxes: [
                { field: 'errorCode', x: 15, y: 10, width: 20, height: 8 },
                { field: 'brand', x: 40, y: 10, width: 15, height: 8 },
                { field: 'model', x: 15, y: 22, width: 35, height: 6 },
                { field: 'diagnosis', x: 15, y: 35, width: 70, height: 12 },
                { field: 'solution', x: 15, y: 55, width: 70, height: 20 }
            ],
            rawText: 'E-301 Daikin FTK-25AV1V...'
        };

        return mockData;
    },

    /**
     * Batch process multiple files
     */
    batchExtract: async (files: File[]): Promise<ExtractedData[]> => {
        const results: ExtractedData[] = [];

        for (const file of files) {
            try {
                const data = await aiImportService.extractFromImage(file);
                results.push(data);
            } catch (error) {
                console.error(`Failed to process ${file.name}`, error);
                // Continue with other files
            }
        }

        return results;
    },

    /**
     * Call Gemini AI API (production implementation)
     */
    callGeminiVision: async (imageUrl: string): Promise<any> => {
        // This would be implemented using @google/genai
        // const { GoogleGenAI } = await import('@google/genai');
        // const genAI = new GoogleGenAI({ apiKey: API_KEY });
        // const model = 'gemini-2.0-flash';
        // 
        // const result = await genAI.models.generateContent({
        //   model,
        //   contents: [{
        //     role: 'user',
        //     parts: [
        //       { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        //       { text: 'Extract error code, brand, model, diagnosis from this HVAC error display' }
        //     ]
        //   }]
        // });
        // 
        // return JSON.parse(result.text);

        // Placeholder for demo
        return {};
    },

    /**
     * Improve JSON recovery from malformed AI responses
     */
    parseAIResponse: (rawResponse: string): ExtractedData | null => {
        try {
            // Try direct JSON parse
            return JSON.parse(rawResponse);
        } catch (e) {
            // Fallback: extract JSON from markdown code blocks
            const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1]);
                } catch (e2) {
                    console.error('JSON recovery failed', e2);
                }
            }

            // Fallback 2: try to find any JSON object
            const objectMatch = rawResponse.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                try {
                    return JSON.parse(objectMatch[0]);
                } catch (e3) {
                    console.error('Object extraction failed', e3);
                }
            }

            return null;
        }
    }
};
