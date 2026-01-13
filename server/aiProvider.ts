import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

type AIProvider = "openai" | "anthropic";

interface AIResponse {
  provider: AIProvider;
  content: string;
}

class AIProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    // Initialize OpenAI (Primary)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://api.openai.com/v1",
      });
      console.log('[AI Provider] OpenAI initialized (Primary)');
    } else {
      console.warn('[AI Provider] OpenAI API key missing - primary provider unavailable');
    }

    // Initialize Anthropic Claude (Backup)
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      console.log('[AI Provider] Anthropic Claude initialized (Backup)');
    } else {
      console.warn('[AI Provider] Anthropic API key missing - backup provider unavailable');
    }

    // Log available providers
    const providers = this.getAvailableProviders();
    console.log(`[AI Provider] Available providers: ${providers.length > 0 ? providers.join(', ') : 'NONE'}`);
  }

  /**
   * Generate text using OpenAI (Primary)
   */
  private async generateWithOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI not initialized");
    }

    console.log('[AI] Calling OpenAI API (Primary)...');
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
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
  }

  /**
   * Generate text using Anthropic Claude (Backup)
   */
  private async generateWithAnthropic(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error("Anthropic not initialized");
    }

    console.log('[AI] Calling Anthropic Claude API (Backup)...');
    
    const response = await this.anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Fast and cost-effective
      max_tokens: 4000,
      system: systemPrompt || "You are an expert credit dispute AI assistant with deep knowledge of FCRA law, cross-bureau conflict detection, and dispute strategies. Provide helpful, accurate, and actionable advice.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : "";
    console.log(`[AI] Anthropic Claude response received (${content.length} chars)`);
    return content;
  }

  /**
   * Generate text with Vision AI for PDF/image analysis (OpenAI only)
   */
  async generateWithVision(imageBase64: string, prompt: string): Promise<string> {
    // Try OpenAI Vision first
    if (this.openai) {
      try {
        console.log('[AI] Calling OpenAI Vision API...');
        
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
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
        console.error("[AI] OpenAI Vision error:", error);
        
        // Try Anthropic Vision as fallback
        if (this.anthropic) {
          console.log('[AI] Falling back to Anthropic Claude Vision...');
          return this.generateWithAnthropicVision(imageBase64, prompt);
        }
        throw error;
      }
    }

    // If OpenAI not available, try Anthropic Vision
    if (this.anthropic) {
      return this.generateWithAnthropicVision(imageBase64, prompt);
    }

    throw new Error("No AI provider available for vision");
  }

  /**
   * Generate with Anthropic Vision (fallback for image analysis)
   */
  private async generateWithAnthropicVision(imageBase64: string, prompt: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error("Anthropic not initialized");
    }

    console.log('[AI] Calling Anthropic Claude Vision API (Backup)...');

    // Extract base64 data and media type
    let base64Data = imageBase64;
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/png";
    
    if (imageBase64.startsWith('data:')) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mediaType = matches[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        base64Data = matches[2];
      }
    }

    const response = await this.anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      system: "You are an expert credit report analyzer. Extract all negative accounts, collections, charge-offs, late payments, and derogatory items from credit reports. Be thorough and accurate.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : "";
    console.log(`[AI] Anthropic Claude Vision response received (${content.length} chars)`);
    return content;
  }

  /**
   * Generate text with automatic fallback
   * Primary: OpenAI → Backup: Anthropic Claude
   */
  async generate(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    // Try OpenAI first (Primary)
    if (this.openai) {
      try {
        const content = await this.generateWithOpenAI(prompt, systemPrompt);
        if (content) {
          return { provider: "openai", content };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[AI] OpenAI failed: ${errorMsg}`);
        console.log('[AI] Attempting fallback to Anthropic Claude...');
      }
    }

    // Try Anthropic Claude (Backup)
    if (this.anthropic) {
      try {
        const content = await this.generateWithAnthropic(prompt, systemPrompt);
        if (content) {
          console.log('[AI] Successfully used Anthropic Claude as fallback');
          return { provider: "anthropic", content };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[AI] Anthropic Claude failed: ${errorMsg}`);
      }
    }

    // Both providers failed
    throw new Error("All AI providers failed. Please check your API keys and try again.");
  }

  /**
   * Check which providers are available
   */
  getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];
    if (this.openai) {
      available.push("openai");
    }
    if (this.anthropic) {
      available.push("anthropic");
    }
    return available;
  }
}

// Export singleton instance
export const aiProvider = new AIProviderService();
