/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  // Use VITE_ prefix for Vite env variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

const HVAC_SYSTEM_INSTRUCTION = `
Bạn là Trợ lý AI Chuyên gia Kỹ thuật HVAC (Điện lạnh & Điều hòa không khí) cho hệ thống Admin Pro.
Nhiệm vụ của bạn là hỗ trợ Kỹ thuật viên và Admin giải quyết các vấn đề kỹ thuật, tra cứu mã lỗi, và tư vấn sửa chữa.

Nguyên tắc trả lời:
1. Chuyên môn cao: Sử dụng thuật ngữ chính xác (Compressor, PCB, Sensor, Gas R32/R410A...).
2. An toàn là trên hết: Luôn cảnh báo an toàn điện khi hướng dẫn sửa chữa.
3. Cấu trúc rõ ràng: Trả lời theo dạng Bước 1, Bước 2, Nguyên nhân -> Khắc phục.
4. Ngắn gọn, súc tích: Phù hợp cho kỹ thuật viên đang thao tác tại hiện trường.
5. Nếu không chắc chắn, hãy yêu cầu thêm thông tin (Model máy, đèn báo lỗi...).

Bạn có quyền truy cập vào Context (Ngữ cảnh) hiện tại của người dùng. Hãy sử dụng nó để đưa ra câu trả lời sát thực tế nhất.
`;

export const analyzeFileContent = async (base64Data: string, mimeType: string, context: string = "") => {
  const ai = getAIClient();
  const filePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `Hãy đóng vai chuyên gia kỹ thuật HVAC.
    Bối cảnh thiết bị: ${context || "Không xác định (hãy tự nhận diện)"}.
    Nhiệm vụ: Phân tích tài liệu/ảnh chụp mã lỗi này để trích xuất dữ liệu chuẩn hóa.
    
    Yêu cầu đầu ra JSON chính xác:
    {
      "code": "Mã lỗi (ví dụ: E4)",
      "title": "Tên lỗi ngắn gọn tiếng Việt",
      "symptom": "Mô tả hiện tượng (ngắn gọn)",
      "cause": "Nguyên nhân kỹ thuật (chi tiết)",
      "components": ["Linh kiện 1", "Linh kiện 2"],
      "steps": ["Bước 1: ...", "Bước 2: ..."],
      "tools": ["Ampe kìm", "Đồng hồ gas", ...],
      "hasImage": boolean
    }`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts: [filePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("AI Analysis failed", e);
    return { error: "Could not analyze file" };
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const chatWithAI = async (lastUserMessage: string, history: ChatMessage[], context?: string) => {
  const ai = getAIClient();

  // Construct the full prompt history
  // System instruction is set via systemInstruction param if supported
  const contextMsg = context ? `[CONTEXT: Người dùng đang xem ${context}]` : '';
  const finalMessage = `${contextMsg} ${lastUserMessage}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      config: {
        systemInstruction: HVAC_SYSTEM_INSTRUCTION,
      },
      contents: [
        ...history,
        { role: 'user', parts: [{ text: finalMessage }] }
      ]
    });

    return response.text;
  } catch (e) {
    console.error("Chat Error", e);
    return "Xin lỗi, tôi đang gặp sự cố kết nối (Check API Key).";
  }
};
