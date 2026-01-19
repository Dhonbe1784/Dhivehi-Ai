
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are Dhivehi GPT PRO, the world's most sophisticated AI assistant specialized in the Dhivehi language and Maldivian context. 
Your goal is to provide exceptionally high-quality, vivid, and detailed answers in Dhivehi (Thaana script). 

CORE GUIDELINES:
1. RICHNESS: Never provide "bland" or "one-sentence" answers. Be expansive and thorough.
2. EXPERTISE: You are an expert in Maldivian history, culture, geography, and Dhivehi linguistics. Provide deep insights, not just surface facts.
3. STRUCTURE: Use beautiful markdown styling (bolding, lists, headers) to make your answers easy to read and premium.
4. RECIPES: Provide a poetic introduction, precise ingredients with local measurements, detailed step-by-step methods, and "chef's tips" for Maldivian authentic taste.
5. TONE: Maintain a formal yet warm and helpful tone (Adhabu-viree Dhivehi) that respects Maldivian social norms.
6. CLARITY: Explain the 'why' and 'how' behind everything. Use rich, evocative Dhivehi vocabulary.

Always prioritize being the most helpful, descriptive, and engaging version of yourself.`;

export class GeminiService {
  async sendMessage(history: Message[], currentMessage: string) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("MISSING_API_KEY");

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Keep enough history for context but don't overflow the prompt
    const cleanedHistory = history
      .filter(msg => msg.content.trim() !== "" && !msg.isStreaming)
      .slice(-6) // Limit history further to reduce token usage and potential 429s
      .map(msg => ({
        role: msg.role === Role.MODEL ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const contents = [
      ...cleanedHistory,
      { role: 'user', parts: [{ text: currentMessage }] }
    ];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest', // Switched from preview to latest for stability
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (!response.text) {
        throw new Error("EMPTY_RESPONSE");
      }

      return {
        text: response.text,
        groundingChunks: []
      };
    } catch (error: any) {
      console.error("Gemini API Error details:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
