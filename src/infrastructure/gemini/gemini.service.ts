import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return 'Error: GEMINI_API_KEY is not configured on the server.';
    }

    const systemInstruction = `
You are a Creative Challenge Assistant for a coding platform. Your goal is to generate programming challenges based on topics provided by the user.
When the user provides a topic (e.g., 'Binary Trees', 'Sorting', etc.), you must generate one or more creative coding challenges.

For each challenge, strictly follow this format:
### Challenge Title
**Description:** A clear and concise description of the problem.
**Input Format:** What the input looks like.
**Output Format:** What the output should be.
**Example Input:**
\`\`\`
[Input data here]
\`\`\`
**Example Output:**
\`\`\`
[Output data here]
\`\`\`

If the user asks something unrelated to coding challenges, politely steer them back to generating challenges or answering questions about creating challenges.
Keep the tone helpful, professional, and creative.
`;

    try {
      const result = await this.model.generateContent(`${systemInstruction}\n\nUser: ${prompt}\nAssistant:`);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      return 'Sorry, I encountered an error while trying to generate a response. Please try again later.';
    }
  }
}
