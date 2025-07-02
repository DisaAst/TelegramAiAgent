import { GoogleGenerativeAI } from "@google/generative-ai";
import { IWebSearchTool } from '../interfaces';
import { WebSearchResult } from '../../types';
import { formatDateTimeContext } from '../../utils/dateTime';

interface CacheEntry {
  result: WebSearchResult;
  expiry: Date;
}

/**
 * Gemini 2.0 Flash with Google Grounding web search tool
 */
export class GeminiGroundingWebSearchTool implements IWebSearchTool {
  public readonly name = 'GeminiGroundingWebSearchTool';
  public readonly version = '1.0.0';
  public readonly description = 'Web search tool using Gemini 2.0 Flash with Google Grounding';

  private genAI: GoogleGenerativeAI;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(private apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Main search method with Google Grounding
   */
  async search(query: string, userTimezone?: string): Promise<WebSearchResult> {
    try {
      const cacheKey = `${query.toLowerCase().trim()}_${userTimezone || 'UTC'}`;
      
      // Check cache first
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Perform search with Gemini Grounding
      const result = await this.performGroundedSearch(query, userTimezone);

      // Cache the result
      this.setCachedResult(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in Gemini grounded search:', error);
      return this.createFallbackResult(query);
    }
  }

  /**
   * Basic search (same as main search since Gemini grounding is cost-effective)
   */
  async basicSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    return this.search(query, userTimezone);
  }

  /**
   * Advanced search (same as main search)
   */
  async advancedSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    return this.search(query, userTimezone);
  }

  /**
   * Check if web search is needed
   */
  async isSearchNeeded(prompt: string): Promise<boolean> {
    const searchKeywords = [
      // English keywords
      'news', 'today', 'current', 'latest', 'recent', 'weather',
      'price', 'stock', 'happening', 'now', 'when', 'where', 'who',
      'this week', 'this month', 'this year', 'trending', 'update',
      'search', 'find', 'what is', 'how much', 'status', 'results',
      
      // Russian keywords  
      'новости', 'сегодня', 'сейчас', 'последние', 'свежие', 'актуальные',
      'погода', 'курс', 'цена', 'биржа', 'котировки', 'события',
      'что происходит', 'что случилось', 'текущий', 'недавно',
      'когда', 'где', 'кто', 'статистика', 'данные', 'найди', 'поищи'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return searchKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * Clean expired cache entries
   */
  cleanCache(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; validEntries: number } {
    const now = new Date();
    const validEntries = Array.from(this.cache.values())
      .filter(entry => entry.expiry > now).length;
    
    return {
      totalEntries: this.cache.size,
      validEntries
    };
  }

  /**
   * Perform grounded search with Gemini 2.0 Flash
   */
  private async performGroundedSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    console.log(`🔍 Performing Gemini grounded search for: ${query}`);

    const dateTimeContext = formatDateTimeContext(userTimezone);

    const groundingTool = {
      googleSearch: {},
    };
    
    // Create model with Google Search grounding
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      tools: [[groundingTool]],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `Current context: ${dateTimeContext}

Please provide accurate, up-to-date information about: "${query}"

Please:
1. Use current, factual information from reliable sources
2. Include specific details like dates, numbers, locations when relevant
3. Provide context to help understand the information
4. Respond in the same language as the query
5. If this is time-sensitive information, prioritize the most recent data

Query: ${query}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(`Gemini grounded search completed for: ${query}`);

    return {
      query,
      results: text,
      timestamp: new Date(),
    };
  }

  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): WebSearchResult | null {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > new Date()) {
      console.log('🎯 Using cached search result');
      return cached.result;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Cache search result
   */
  private setCachedResult(cacheKey: string, result: WebSearchResult): void {
    const expiry = new Date(Date.now() + this.CACHE_DURATION);
    this.cache.set(cacheKey, { result, expiry });
  }

  /**
   * Create fallback result for errors
   */
  private createFallbackResult(query: string): WebSearchResult {
    const fallbackMessage = query.toLowerCase().includes('русск') || 
                           /[а-яё]/i.test(query) ? 
      `Извините, не удалось выполнить поиск по запросу "${query}". Рекомендую проверить актуальную информацию из специализированных источников.` :
      `Sorry, I couldn't perform a search for "${query}". I recommend checking current information from specialized sources.`;
    
    return {
      query,
      results: fallbackMessage,
      timestamp: new Date(),
    };
  }
} 