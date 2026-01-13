
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
1. DO NOT INTRODUCE YOURSELF: Never say "I am an AI" or "As a language model".
2. START IMMEDIATELY: Provide the answer directly.
3. LANGUAGE: Professional Dhivehi (Thaana).
4. FORMATTING: Use clear line breaks and bullet points.`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface StreamResult {
  text: string;
}

export class GeminiService {
  private async *attemptStream(contents: any[], maxRetries = 3) {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
          throw new Error("MISSING_API_KEY");
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const result = await ai.models.generateContentStream({
          model: 'gemini-flash-lite-latest',
          contents: contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1,
            topP: 0.95,
            tools: [] // Strictly no tools for maximum free-tier compatibility
          },
        });

        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            yield c.text;
          }
        }
        return; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        const errorStr = JSON.stringify(error).toUpperCase();
        
        // If it's a rate limit error, wait and retry
        if (errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("429")) {
          if (i < maxRetries - 1) {
            const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
            console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime)}ms...`);
            await sleep(waitTime);
            continue;
          }
        }
        throw error; // Re-throw if not a rate limit or we've exhausted retries
      }
    }
    throw lastError;
  }

  async *streamChat(history: Message[], currentMessage: string) {
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

    yield* this.attemptStream(contents);
  }
}

export const geminiService = new GeminiService();
