
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// Declare process to satisfy TypeScript
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are a helpful and intelligent AI assistant specialized in the Dhivehi language and Maldivian culture. 
Your name is "Test Dhivehi GPT". 
When communicating:
1. Prioritize responding in fluent, grammatically correct Dhivehi (Thaana script).
2. Use a respectful and professional tone.
3. If the user asks in English, you can reply in English, but always offer to continue in Dhivehi.
4. You have deep knowledge of Maldivian history, geography, laws, and traditions.
5. Ensure your responses are rendered correctly for RTL (Right-to-Left) reading.`;

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (!this.ai) {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        console.warn("API_KEY is not defined in process.env. The application may not function correctly.");
      }
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return this.ai;
  }

  async *streamChat(history: Message[], currentMessage: string) {
    const ai = this.getClient();
    
    // Convert history messages to the format expected by the GenAI SDK
    const contents = history.map(msg => ({
      role: msg.role === Role.MODEL ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add the latest user message
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });

    try {
      const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          topP: 0.95,
        },
      });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        yield c.text || "";
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("not found")) {
        throw new Error("API_KEY_ERROR");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
