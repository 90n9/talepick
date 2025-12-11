import { GoogleGenAI } from '@google/genai';

// This is a placeholder service. In a real app, you would verify the API key availability.
// The component using this should handle the missing API key error gracefully.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const translateText = async (text: string, targetLang: string = 'Thai'): Promise<string> => {
  const ai = getAIClient();
  if (!ai) {
    // Simulate delay for mock environment
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `[จำลองการแปลเป็น${targetLang}]: ${text}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text to ${targetLang}. Only return the translated text, no explanation.\n\nText: "${text}"`,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini Translation Error:', error);
    return `[เกิดข้อผิดพลาดในการแปล]: ${text}`;
  }
};

export const generateSceneDescription = async (context: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return 'ห้องลึกลับที่เต็มไปด้วยวัตถุโบราณ ฝุ่นละอองลอยฟุ้งต้องแสงที่ส่องผ่านเพดานลงมา';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, atmospheric description for a game scene in Thai language based on this context: ${context}`,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    return 'ไม่สามารถสร้างคำบรรยายได้';
  }
};
