/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";
import { systemService } from '../services/systemService';

// Cache for API key to avoid repeated Firebase calls
let cachedApiKey: string | null = null;
let cachedModel: string | null = null;

// Load settings from Firebase (call once on init)
export const loadAISettings = async () => {
  try {
    const settings = await systemService.getSettings();
    cachedApiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
    cachedModel = settings.aiModel || 'gemini-2.5-flash';
  } catch (e) {
    console.error("Failed to load AI settings from Firebase", e);
    cachedApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    cachedModel = 'gemini-2.5-flash';
  }
};

const getAIClient = () => {
  const apiKey = cachedApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

const getModelName = () => {
  const VALID_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-thinking-exp'];
  const model = cachedModel || 'gemini-2.5-flash';
  return VALID_MODELS.includes(model) ? model : 'gemini-2.5-flash';
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
    text: `Bạn là kỹ sư HVAC chuyên nghiệp.
    Phân tích tài liệu kỹ thuật / hình ảnh dưới đây.
    Ngữ cảnh thiết bị: ${context || "Tự động xác định"}.

    ⚠️ Ưu tiên:
    - Mã lỗi chính xác (Error Code)
    - Mạch điện, bo PCB, sensor, Block, Gas
    - Chuẩn kỹ thuật điều hòa dân dụng & công nghiệp
    - Ngôn ngữ: TIẾNG VIỆT 100%

    Xuất kết quả JSON đúng schema sau:
    {
      "code": "Mã lỗi (VD: E1, U4...)",
      "title": "Tên lỗi tiếng Việt ngắn gọn",
      "symptom": "Hiện tượng (VD: Máy chớp đèn, không lạnh...)",
      "cause": "Nguyên nhân kỹ thuật chi tiết",
      "components": ["Linh kiện liên quan 1", "Linh kiện 2"],
      "steps": ["Bước 1: Kiểm tra...", "Bước 2: Thay thế..."],
      "tools": ["Dụng cụ 1", "Dụng cụ 2"],
      "hasImage": boolean
    }`
  };

  try {
    const modelName = getModelName();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [filePart, textPart]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    });

    // Parse JSON with error handling for truncated responses
    const rawText = response.text || '{}';
    try {
      return JSON.parse(rawText);
    } catch (parseError) {
      console.warn("JSON parse error, attempting to fix truncated response:", parseError);
      // Try to extract valid JSON from potentially truncated response
      try {
        // Find the last complete JSON object
        const lastBrace = rawText.lastIndexOf('}');
        if (lastBrace > 0) {
          const fixedJson = rawText.substring(0, lastBrace + 1);
          return JSON.parse(fixedJson);
        }
      } catch {
        // If still fails, return partial data
        console.error("Could not parse AI response:", rawText);
      }
      return { error: "AI trả về dữ liệu không hợp lệ. Vui lòng thử lại." };
    }
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
  const contextMsg = context ? `[CONTEXT: Người dùng đang xem ${context}]` : '';
  const finalMessage = `${contextMsg} ${lastUserMessage}`;

  try {
    const modelName = getModelName();
    const response = await ai.models.generateContent({
      model: modelName,
      // @ts-ignore - SDK typing issue for systemInstruction/generationConfig in some versions
      systemInstruction: HVAC_SYSTEM_INSTRUCTION,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: finalMessage }] }
      ],
      config: {
         temperature: 0.4,
         maxOutputTokens: 2048,
      }
    });

    return response.text;
  } catch (e) {
    console.error("Chat Error", e);
    return "Xin lỗi, tôi đang gặp sự cố kết nối (Check API Key).";
  }
};
