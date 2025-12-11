import { GoogleGenAI } from '@google/genai';
import type { Story } from './types';

// Consult the Oracle: recommend a story based on mood and available stories.
export const getGeminiRecommendation = async (
  mood: string,
  stories: Story[],
): Promise<string> => {
  try {
    const apiKey =
      typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : undefined;

    if (!apiKey) {
      console.warn('API Key missing for Gemini.');
      return 'เทพพยากรณ์เงียบงันในขณะนี้ (ไม่พบ API Key) ลองเล่น The Neon Protocol ดูสิ';
    }

    const ai = new GoogleGenAI({ apiKey });
    const storyContext = stories
      .map((story) => `- ${story.title} (${story.genre}): ${story.description}`)
      .join('\n');

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

    return response.text || 'หมอกควันบดบังนิมิตของข้า... จงลองใหม่อีกครั้ง';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'การเชื่อมต่อกับเทพพยากรณ์ขาดหาย กรุณาลองใหม่ภายหลัง';
  }
};
