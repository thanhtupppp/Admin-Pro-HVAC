
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeFileContent = async (base64Data: string, mimeType: string, prompt: string = "") => {
  const ai = getAIClient();
  const filePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: prompt || `Hãy phân tích tài liệu kỹ thuật này. 
    Nếu là PDF, hãy đọc toàn bộ nội dung và trích xuất thông tin mã lỗi theo cấu trúc JSON:
    {
      "code": "Mã lỗi",
      "title": "Tên lỗi",
      "symptom": "Triệu chứng",
      "cause": "Nguyên nhân",
      "components": ["Linh kiện liên quan"],
      "steps": ["Các bước sửa chữa"],
      "hasImage": boolean (có sơ đồ/hình ảnh minh họa quan trọng không)
    }`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [filePart, textPart] },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithAI = async (message: string, context?: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Context: ${context || 'Hệ thống quản lý mã lỗi kỹ thuật'}\n\nUser query: ${message}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  return response.text;
};
