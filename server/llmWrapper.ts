import { aiProvider } from "./aiProvider";

/**
 * Wrapper function that maintains backward compatibility with invokeLLM
 * while using the new fallback AI provider system
 */
export async function invokeLLMWithFallback(params: {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}): Promise<{
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}> {
  try {
    // Convert messages to a single prompt string
    const prompt = params.messages
      .map((msg) => {
        if (msg.role === "system") {
          return `SYSTEM: ${msg.content}`;
        } else if (msg.role === "user") {
          return `USER: ${msg.content}`;
        } else {
          return `ASSISTANT: ${msg.content}`;
        }
      })
      .join("\n\n");

    // Use fallback AI provider
    const result = await aiProvider.generate(prompt);

    console.log(`[LLM] Used provider: ${result.provider}`);

    // Return in the expected format
    return {
      choices: [
        {
          message: {
            content: result.content,
          },
        },
      ],
    };
  } catch (error) {
    console.error("[LLM] All providers failed:", error);
    throw error;
  }
}
