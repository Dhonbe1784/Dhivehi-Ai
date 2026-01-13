
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// The API key MUST be obtained from process.env.API_KEY
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
4. FACTUAL ACCURACY: Answer based on your internal knowledge. 
5. FORMATTING: Use clear line breaks. For lists, use bullet points.`;

export interface StreamResult {
  text: string;
  groundingChunks?: any[];
}

export class GeminiService {
  async *streamChat(history: Message[], currentMessage: string) {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
      throw new Error("MISSING_API_KEY_ON_DEPLOYMENT");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
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
      // Using gemini-flash-lite-latest which is the most stable for free-tier users.
      // We remove tools entirely as they often trigger billing requirements/quota limits.
      const result = await ai.models.generateContentStream({
        model: 'gemini-flash-lite-latest',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          topP: 0.95,
          tools: [] // Removed googleSearch to prevent billing/quota errors
        },
      });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield {
            text: c.text,
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
