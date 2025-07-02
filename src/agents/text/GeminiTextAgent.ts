import { z } from 'zod';
import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { ITextAgent } from '../interfaces';
import { IWebSearchTool } from '../../tools';
import { AIResponse, ChatMessage } from '../../types';
import { AI_PROMPTS } from '../../constants';
import { MODEL_CONFIG, MODEL_PARAMS } from '../../constants';
import { formatDateTimeContext } from '../../utils';

/**
 * Gemini-based text processing agent with web search capabilities
 */
export class GeminiTextAgent implements ITextAgent {
  public readonly name = 'GeminiTextAgent';
  public readonly version = '1.0.0';

  private geminiModel;

  constructor(
    private apiKey: string,
    private webSearchTool: IWebSearchTool,
    private chatHistoryLimit: number = 7
  ) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    this.geminiModel = google(MODEL_CONFIG.TEXT_AGENT);
  }

  /**
   * Process text input and generate response
   */
  async processText(
    prompt: string, 
    context?: string, 
    userId?: number
  ): Promise<AIResponse> {
    try {
      const userTimezone = this.getUserTimezone(userId);
      const dateTimeContext = formatDateTimeContext(userTimezone);
      const fullPrompt = `${dateTimeContext}\n\n${context || ''}Current user question: ${prompt}`;

      const { text, steps } = await generateText({
        model: this.geminiModel,
        system: AI_PROMPTS.SYSTEM.MAIN,
        prompt: fullPrompt,
        tools: {
          webSearch: tool({
            description: AI_PROMPTS.WEB_SEARCH.DESCRIPTION,
            parameters: z.object({
              query: z.string().describe(AI_PROMPTS.WEB_SEARCH.QUERY_DESCRIPTION),
            }),
            execute: async ({ query }) => {
              console.log("Web search tool called");
              const searchResult = await this.webSearchTool.search(query, userTimezone);
              return {
                query: searchResult.query,
                results: searchResult.results,
                timestamp: searchResult.timestamp.toISOString(),
              };
            },
          }),
        },
        maxSteps: MODEL_PARAMS.TEXT_GENERATION.MAX_STEPS,
        maxTokens: MODEL_PARAMS.TEXT_GENERATION.MAX_TOKENS,
        temperature: MODEL_PARAMS.TEXT_GENERATION.TEMPERATURE,
      });

      return {
        text,
        timestamp: new Date(),
        usedWebSearch: steps && steps.length > 1,
        steps: steps?.length || 1,
        mediaProcessed: false,
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Get user timezone (placeholder - should be injected via dependency)
   */
  private getUserTimezone(userId?: number): string | undefined {
    // This would normally come from UserSettingsService
    // For now, return undefined to use UTC
    return undefined;
  }
} 