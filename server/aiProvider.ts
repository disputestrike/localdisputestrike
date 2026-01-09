import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

type AIProvider = "manus" | "openai" | "claude";

interface AIResponse {
  provider: AIProvider;
  content: string;
}

class AIProviderService {
  private openai: OpenAI | null = null;
  private claude: Anthropic | null = null;
  private manusApiUrl: string;
  private manusApiKey: string;

  constructor() {
    this.manusApiUrl = process.env.BUILT_IN_FORGE_API_URL || "";
    this.manusApiKey = process.env.BUILT_IN_FORGE_API_KEY || "";

    // Initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Claude if API key is provided
    if (process.env.ANTHROPIC_API_KEY) {
      this.claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Generate text using Manus AI (primary provider)
   */
  private async generateWithManus(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.manusApiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.manusApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Manus API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Manus AI error:", error);
      throw error;
    }
  }

  /**
   * Generate text using OpenAI (first fallback)
   */
  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI error:", error);
      throw error;
    }
  }

  /**
   * Generate text using Claude (second fallback)
   */
  private async generateWithClaude(prompt: string): Promise<string> {
    if (!this.claude) {
      throw new Error("Claude API key not configured");
    }

    try {
      const response = await this.claude.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === "text");
      return textContent && textContent.type === "text" ? textContent.text : "";
    } catch (error) {
      console.error("Claude error:", error);
      throw error;
    }
  }

  /**
   * Generate text with automatic fallback
   * Tries: Manus → OpenAI → Claude
   */
  async generate(prompt: string): Promise<AIResponse> {
    const providers: AIProvider[] = ["manus", "openai", "claude"];
    const errors: Record<AIProvider, string> = {
      manus: "",
      openai: "",
      claude: "",
    };

    for (const provider of providers) {
      try {
        console.log(`[AI] Attempting ${provider}...`);

        let content: string;
        if (provider === "manus") {
          content = await this.generateWithManus(prompt);
        } else if (provider === "openai") {
          content = await this.generateWithOpenAI(prompt);
        } else {
          content = await this.generateWithClaude(prompt);
        }

        if (content) {
          console.log(`[AI] Success with ${provider}`);
          return { provider, content };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors[provider] = errorMsg;
        console.warn(`[AI] ${provider} failed: ${errorMsg}`);
        continue; // Try next provider
      }
    }

    // All providers failed
    const errorSummary = Object.entries(errors)
      .map(([provider, error]) => `${provider}: ${error}`)
      .join(" | ");
    throw new Error(`All AI providers failed: ${errorSummary}`);
  }

  /**
   * Check which providers are available
   */
  getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];

    if (this.manusApiUrl && this.manusApiKey) {
      available.push("manus");
    }

    if (this.openai) {
      available.push("openai");
    }

    if (this.claude) {
      available.push("claude");
    }

    return available;
  }

  /**
   * Get provider status
   */
  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      manus: !!(this.manusApiUrl && this.manusApiKey),
      openai: !!this.openai,
      claude: !!this.claude,
    };
  }
}

// Export singleton instance
export const aiProvider = new AIProviderService();
