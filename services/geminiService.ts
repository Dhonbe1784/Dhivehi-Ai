
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are "Dhivehi GPT Pro", an elite AI assistant. 
Your primary goal is to assist Maldivians with high-quality Dhivehi (Thaana) responses.

Guidelines:
1. Always respond in fluent, grammatically correct Dhivehi unless English is requested.
2. Use professional and respectful Maldivian honorifics.
3. Use the provided Google Search tool to verify current events, news, and Maldivian laws.
4. Format responses for Right-to-Left (RTL) rendering. Use lists and clear paragraphs.
5. If search results are used, incorporate the information naturally into your answer.`;

export interface StreamResult {
  text: string;
  groundingChunks?: any[];
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (!this.ai) {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY is missing. Please set VITE_GEMINI_API_KEY in your environment.");
      }
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return this.ai;
  }

  async *streamChat(history: Message[], currentMessage: string) {
    const ai = this.getClient();
    
    const cleanedHistory = history.filter(msg => 
      msg.content.trim() !== "" && 
      !msg.isStreaming &&
      msg.content !== currentMessage
    );

    const contents = cleanedHistory.map(msg => ({
      role: msg.role === Role.MODEL ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    contents.push({ role: 'user', parts: [{ text: currentMessage }] });

    try {
      const result = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          topP: 0.9,
          tools: [{ googleSearch: {} }]
        },
      });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text || c.candidates?.[0]?.groundingMetadata) {
          yield {
            text: c.text || "",
            groundingChunks: c.candidates?.[0]?.groundingMetadata?.groundingChunks
          };
        }
      }
    } catch (error: any) {
      console.error("Dhivehi GPT Pro Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
