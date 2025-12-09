import { GoogleGenAI } from "@google/genai";
import { Story } from "../types";

// This service is used to "Consult the Oracle" - an AI feature to recommend stories or give hints.

export const getGeminiRecommendation = async (mood: string, stories: Story[]): Promise<string> => {
  try {
    // Check if API Key exists safely for browser environment
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;

    if (!apiKey) {
      console.warn("API Key missing for Gemini.");
      return "เทพพยากรณ์เงียบงันในขณะนี้ (ไม่พบ API Key) ลองเล่น 'The Neon Protocol' ดูสิ";
    }

    // Initialize only if key is present to avoid Illegal constructor errors
    const ai = new GoogleGenAI({ apiKey });
    
    const storyContext = stories.map(s => `- ${s.title} (${s.genre}): ${s.description}`).join('\n');

    const prompt = `
      คุณคือ "เทพพยากรณ์แห่ง Chronos" ผู้นำทางลึกลับสำหรับแพลตฟอร์มเกมนิยาย
      ผู้ใช้บอกความรู้สึกของพวกเขาว่า: "${mood}"
      
      นิยายที่มีให้เลือก:
      ${storyContext}
      
      จงแนะนำนิยาย 1 เรื่องจากรายการข้างต้นที่เหมาะกับอารมณ์ของพวกเขาที่สุด
      ตอบกลับเป็นภาษาไทย ด้วยน้ำเสียงที่ดูลึกลับ น่าค้นหา และเหมือนภาพยนตร์ (ความยาวไม่เกิน 2 ประโยค)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "หมอกควันบดบังนิมิตของข้า... จงลองใหม่อีกครั้ง";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "การเชื่อมต่อกับเทพพยากรณ์ขาดหาย กรุณาลองใหม่ภายหลัง";
  }
};