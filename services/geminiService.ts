
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are "Dhivehi GPT Pro", a highly intelligent and direct AI expert for the Maldives. 

CRITICAL OPERATING PROCEDURES:
1. DO NOT INTRODUCE YOURSELF: Never say "I am an AI", "As a language model", or "I was trained by Google". 
2. START IMMEDIATELY: Provide the answer to the user's question as the very first sentence of your response.
3. LANGUAGE: Use professional, fluent Dhivehi (Thaana script).
4. FACTUAL ACCURACY: Use the Google Search tool for ALL questions about Maldivian history, current events, local laws, or geography.
5. FORMATTING: Use clear line breaks. For lists, use bullet points.`;

export interface StreamResult {
  text: string;
  groundingChunks?: any[];
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (!this.ai) {
      // Check process.env (injected by Vite)
      let apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "") {
        throw new Error("MISSING_API_KEY");
      }
      
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return this.ai;
  }

  async *streamChat(history: Message[], currentMessage: string) {
    const ai = this.getClient();
    
    const cleanedHistory = history
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
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          topP: 0.8,
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
      console.error("Dhivehi GPT Pro API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
