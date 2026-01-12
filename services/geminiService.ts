
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const SYSTEM_INSTRUCTION = `You are "Dhivehi GPT", a professional and highly intelligent AI assistant developed to help Maldivians. 

Core Guidelines:
1. Always respond in fluent, high-quality Dhivehi (Thaana script) unless the user explicitly asks for another language.
2. Use respectful Maldivian address forms.
3. You have expert-level knowledge of Maldivian history, Islamic values, local laws, and geography.
4. Your responses must be structured for perfect RTL (Right-to-Left) rendering.
5. If you use technical English terms, provide a brief Dhivehi explanation.
6. Be concise but helpful.`;

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (!this.ai) {
      const apiKey = process.env.API_KEY;
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return this.ai;
  }

  async *streamChat(history: Message[], currentMessage: string) {
    const ai = this.getClient();
    
    // Filter history: remove the message currently being streamed and any empty messages
    // The API requires alternating roles: user, model, user, model...
    const validHistory = history.filter(msg => 
      msg.content.trim() !== "" && 
      !msg.isStreaming && 
      msg.content !== currentMessage // Don't include the current message yet
    );

    const contents = validHistory.map(msg => ({
      role: msg.role === Role.MODEL ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add the current user message as the final part
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });

    try {
      const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
          topP: 0.95,
        },
      });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        yield c.text || "";
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
