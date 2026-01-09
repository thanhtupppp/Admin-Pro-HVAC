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
    Phân tích tài liệu kỹ thuật / hình ảnh / PDF dưới đây.
    Ngữ cảnh thiết bị: ${context || "Tự động xác định"}.

    ⚠️ Yêu cầu quan trọng:
    1. Chỉ trích xuất thông tin của Một Mã Lỗi nổi bật nhất nếu tài liệu có nhiều lỗi.
    2. Nội dung ngắn gọn, súc tích (Max 5 bước khắc phục).
    3. Trả về format JSON thô (Raw JSON), KHÔNG dùng Markdown block (\`\`\`json).
    4. Ngôn ngữ: TIẾNG VIỆT 100%.

    Schema JSON kết quả:
    {
      "code": "Mã lỗi (VD: E1...)",
      "title": "Tên lỗi",
      "symptom": "Hiện tượng ngắn gọn",
      "cause": "Nguyên nhân (Max 2 câu)",
      "components": ["Linh kiện 1", "Linh kiện 2"],
      "steps": ["Bước 1...", "Bước 2..."],
      "tools": ["Dụng cụ 1"],
      "hasImage": boolean,
      "confidence": number
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
        temperature: 0.1,
        maxOutputTokens: 8192, // Increased for PDF content
      }
    });

    // Parse JSON with robust handling
    let rawText = response.text || '{}';
    console.log("AI Raw Response:", rawText); // Debug logging

    // 1. Remove Markdown code blocks if present
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(rawText);
    } catch (parseError) {
      console.warn("JSON parse error:", parseError);

      // 2. Try to find the JSON object via Regex (greedy match first)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Continue to fix strategy
        }
      }

      // 3. Robust JSON Fixer (Stack-based)
      try {
        let fixedJson = rawText.trim();
        const stack: string[] = [];
        let inString = false;
        let isEscaped = false;

        for (let i = 0; i < fixedJson.length; i++) {
          const char = fixedJson[i];

          if (isEscaped) {
            isEscaped = false;
            continue;
          }

          if (char === '\\') {
            isEscaped = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') stack.push('}');
            else if (char === '[') stack.push(']');
            else if (char === '}' || char === ']') {
              if (stack.length > 0 && stack[stack.length - 1] === char) {
                stack.pop();
              }
            }
          }
        }

        // Close open string if truncated
        if (inString) {
          fixedJson += '"';
        }

        // Close open structures (LIFO)
        while (stack.length > 0) {
          fixedJson += stack.pop();
        }

        console.log("Fixed Truncated JSON:", fixedJson);
        return JSON.parse(fixedJson);
      } catch (finalError) {
        console.error("Could not parse AI response:", finalError);
      }

      return {
        error: "Không thể đọc dữ liệu từ AI. Vui lòng thử lại với file nhỏ hơn hoặc rõ nét hơn.",
        raw: rawText
      };
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
