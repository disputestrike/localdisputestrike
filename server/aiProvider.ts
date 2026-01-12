import OpenAI from "openai";

type AIProvider = "openai" | "builtin";

interface AIResponse {
  provider: AIProvider;
  content: string;
}

class AIProviderService {
  private openai: OpenAI;

  constructor() {
    // Use the user's OpenAI API key from .env
    // Explicitly set baseURL to OpenAI's official API to override any proxy settings
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
    });
    
    console.log('[AI Provider] Initialized with OpenAI API key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    console.log('[AI Provider] Using OpenAI base URL: https://api.openai.com/v1');
  }

  /**
   * Generate text using OpenAI (primary provider)
   */
  private async generateWithOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      console.log('[AI] Calling OpenAI API...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Use gpt-4o-mini for cost-effective responses
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are an expert credit dispute AI assistant with deep knowledge of FCRA law, cross-bureau conflict detection, and dispute strategies. Provide helpful, accurate, and actionable advice."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || "";
      console.log(`[AI] OpenAI response received (${content.length} chars)`);
      return content;
    } catch (error) {
      console.error("[AI] OpenAI error:", error);
      throw error;
    }
  }

  /**
   * Generate text with Vision AI for PDF/image analysis
   */
  async generateWithVision(imageBase64: string, prompt: string): Promise<string> {
    try {
      console.log('[AI] Calling OpenAI Vision API...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // gpt-4o-mini supports vision
        messages: [
          {
            role: "system",
            content: "You are an expert credit report analyzer. Extract all negative accounts, collections, charge-offs, late payments, and derogatory items from credit reports. Be thorough and accurate."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("[AI] Vision API error:", error);
      throw error;
    }
  }

  /**
   * Generate text with automatic fallback
   */
  async generate(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    try {
      console.log('[AI] Generating response...');
      const content = await this.generateWithOpenAI(prompt, systemPrompt);
      
      if (content) {
        return { provider: "openai", content };
      }
      
      throw new Error("Empty response from AI");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[AI] Generation failed: ${errorMsg}`);
      throw new Error(`AI generation failed: ${errorMsg}`);
    }
  }

  /**
   * Check which providers are available
   */
  getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];
    if (process.env.OPENAI_API_KEY) {
      available.push("openai");
    }
    return available;
  }
}

// Export singleton instance
export const aiProvider = new AIProviderService();
