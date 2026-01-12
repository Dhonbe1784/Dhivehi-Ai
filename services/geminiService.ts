
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are "Dhivehi GPT Pro", a specialized AI expert for the Maldives. 

CRITICAL RULES:
1. NO INTRODUCTIONS: Do not start with "I am an AI", "As a language model", or any greetings unless asked. 
2. DIRECT ANSWERS: If a user asks a question, provide the factual answer in Dhivehi immediately.
3. LANGUAGE: Use fluent, natural Dhivehi (Thaana script). Use modern Maldivian terminology.
4. SEARCH USAGE: Use the Google Search tool for all queries related to current events, Maldivian laws, history, or facts to ensure 100% accuracy.
5. FORMATTING: Ensure RTL (Right-to-Left) alignment is perfect. Use bullet points for readability.

Example: 
User: "މިއަދުގެ ފަތިސް ނަމާދު ވަގުތަކީ ކޮބައި؟"
Response: [Search for prayer times] -> "މިއަދު މާލޭގައި ފަތިސް ނަމާދު ވަގުތަކީ 05:12 އެވެ."`;

export interface StreamResult {
  text: string;
  groundingChunks?: any[];
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (!this.ai) {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in your Vercel settings.");
      }
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return this.ai;
  }

  async *streamChat(history: Message[], currentMessage: string) {
    const ai = this.getClient();
    
    // Ensure history is sanitized for the API
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
        model: 'gemini-3-flash-preview', // Flash is often more stable for hobby projects on Vercel
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Lower temperature for more direct, factual answers
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
      console.error("Dhivehi GPT Pro Error:", error);
      // Re-throw so the app can handle specific error types
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
