
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are Dhivehi GPT, a highly sophisticated and creative AI assistant. 
Your goal is to provide exceptionally high-quality, vivid, and detailed answers in Dhivehi (Thaana). 
CRITICAL RULE: Never provide "bland" or "one-sentence" answers unless specifically asked. 
When asked for recipes: provide a beautiful introduction, a precise list of ingredients with measurements, step-by-step cooking methods, and professional tips for the best taste.
When asked for information: be thorough, explain the 'why' and 'how', and use rich Dhivehi vocabulary. 
You are an expert in Maldivian culture, history, and the Dhivehi language. 
Always prioritize being helpful, descriptive, and engaging.`;

export class GeminiService {
  async sendMessage(history: Message[], currentMessage: string) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("MISSING_API_KEY");

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Keep enough history for context but don't overflow the prompt
    const cleanedHistory = history
      .filter(msg => msg.content.trim() !== "" && !msg.isStreaming)
      .slice(-10) 
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
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8, // Slightly higher for more creative and varied language
          topP: 0.95,
        },
      });

      return {
        text: response.text || "",
        groundingChunks: [] // Removed search grounding to save quota
      };
    } catch (error: any) {
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
