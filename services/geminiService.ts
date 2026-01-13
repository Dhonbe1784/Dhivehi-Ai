
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// The API key MUST be obtained from process.env.API_KEY
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = "You are Dhivehi GPT. Direct answers in Dhivehi (Thaana). Be extremely brief and concise.";

export class GeminiService {
  async *streamChat(history: Message[], currentMessage: string) {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
      throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Keep history minimal to stay under token limits
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
    
    try {
      const result = await ai.models.generateContentStream({
        model: 'gemini-flash-lite-latest',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error: any) {
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
