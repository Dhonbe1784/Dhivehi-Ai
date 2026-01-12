
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// Declare process to satisfy TypeScript as it's defined globally by Vite at build time
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
2. Use a respectful and professional tone (respectful Maldivian forms like "Iba" and "Kaleyge").
3. If the user asks in English, you can reply in English, but always offer to continue in Dhivehi.
4. You have deep knowledge of Maldivian history, geography, laws, and traditions.
5. If you provide code or technical terms, you can keep them in English but explain them in Dhivehi.
6. Always ensure your responses are rendered correctly for RTL (Right-to-Left) reading.`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing with the API key from environment variable as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *streamChat(history: Message[], currentMessage: string) {
    // Convert history messages to the format expected by the GenAI SDK
    const contents = history.map(msg => ({
      role: msg.role === Role.MODEL ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add the latest user message to the contents array
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });

    // Use ai.models.generateContentStream to query the model with history and system instruction
    const result = await this.ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    for await (const chunk of result) {
      // Access the .text property directly from the response chunk
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  }
}

export const geminiService = new GeminiService();
