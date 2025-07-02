import { z } from 'zod';
import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { IImageAgent } from '../interfaces';
import { IWebSearchTool } from '../../tools/interfaces';
import { AIResponse, MediaContent } from '../../types';
import { AI_PROMPTS } from '../../constants/prompts';
import { MODEL_CONFIG, MODEL_PARAMS } from '../../constants/aiModels';
import { formatDateTimeContext } from '../../utils/dateTime';

/**
 * Gemini-based image analysis agent with web search capabilities
 */
export class GeminiImageAgent implements IImageAgent {
  public readonly name = 'GeminiImageAgent';
  public readonly version = '1.0.0';

  private geminiModel;

  constructor(
    private apiKey: string,
    private webSearchTool: IWebSearchTool
  ) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    this.geminiModel = google(MODEL_CONFIG.IMAGE_AGENT);
  }

  /**
   * Analyze image content
   */
  async analyzeImage(
    imageData: MediaContent, 
    prompt?: string, 
    userTimezone?: string
  ): Promise<AIResponse> {
    try {
      const dateTimeContext = formatDateTimeContext(userTimezone);
      
      if (!imageData.data) {
        throw new Error('Image data not found');
      }

      const content = await this.createMultimodalContent(
        prompt || AI_PROMPTS.IMAGE.ANALYZE_DEFAULT, 
        imageData
      );
      
      const systemPrompt = `${AI_PROMPTS.SYSTEM.IMAGE_ANALYSIS}\n\nCurrent context: ${dateTimeContext}`;

      const { text: responseText, steps } = await generateText({
        model: this.geminiModel,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: content,
          }
        ],
        tools: {
          webSearch: tool({
            description: AI_PROMPTS.WEB_SEARCH.DESCRIPTION,
            parameters: z.object({
              query: z.string().describe(AI_PROMPTS.WEB_SEARCH.QUERY_DESCRIPTION),
            }),
            execute: async ({ query }) => {
              console.log("Web search tool called from image analysis");
              const searchResult = await this.webSearchTool.search(query, userTimezone);
              return {
                query: searchResult.query,
                results: searchResult.results,
                timestamp: searchResult.timestamp.toISOString(),
              };
            },
          }),
        },
        maxSteps: MODEL_PARAMS.IMAGE_ANALYSIS.MAX_STEPS,
        topP: MODEL_PARAMS.IMAGE_ANALYSIS.TOP_P,
        maxTokens: MODEL_PARAMS.IMAGE_ANALYSIS.MAX_TOKENS,
        temperature: MODEL_PARAMS.IMAGE_ANALYSIS.TEMPERATURE,
      });
      
      console.log(`🖼️ Processed image data: ${imageData.fileSize} bytes`);
      return {
        text: responseText,
        timestamp: new Date(),
        usedWebSearch: steps && steps.length > 1,
        steps: steps?.length || 1,
        mediaProcessed: true,
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      console.log(`❌ Image processing failed: ${imageData.fileSize} bytes`);
      throw new Error('Failed to analyze image');
    }
  }

  /**
   * Create multimodal content for image analysis
   */
  private async createMultimodalContent(text: string, imageData: MediaContent): Promise<any[]> {
    const content: any[] = [
      {
        type: 'text',
        text: text
      }
    ];

    if (imageData && imageData.data) {
      const base64Data = Buffer.from(imageData.data).toString('base64');
      content.push({
        type: "image",
        image: `data:${imageData.mimeType};base64,${base64Data}`,
      });
    }

    return content;
  }
} 