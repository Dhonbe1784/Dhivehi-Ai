
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// The API key MUST be obtained from process.env.API_KEY
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are "Dhivehi GPT Lite". 
Rules:
1. Respond ONLY in Dhivehi (Thaana).
2. BE EXTREMELY CONCISE. Use as few words as possible.
3. No introductions. No "As an AI".
4. Direct answers only.`;

export class GeminiService {
  async *streamChat(history: Message[], currentMessage: string) {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
      throw new Error("MISSING_API_KEY");
    }

    // AGGRESSIVE TRUNCATION: Only take the last 4 messages to save tokens
    const recentHistory = history.slice(-4);
    
    const cleanedHistory = recentHistory
      .filter(msg => msg.content.trim() !== "" && !msg.isStreaming)
      .map(msg => ({
        role: msg.role === Role.MODEL ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const contents = [
      ...cleanedHistory,
      { role: 'user', parts: [{ text: currentMessage }] }
    ];

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    try {
      const result = await ai.models.generateContentStream({
        model: 'gemini-flash-lite-latest',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1, // Low temperature for faster, predictable responses
          tools: [] 
        },
      });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error: any) {
      // Pass the raw error up to App.tsx for specialized handling
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
