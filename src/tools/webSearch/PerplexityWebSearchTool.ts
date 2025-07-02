import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { IWebSearchTool, SearchClassification } from '../interfaces';
import { WebSearchResult } from '../../types';
import { AI_PROMPTS } from '../../constants/prompts';
import { MODEL_CONFIG, MODEL_PARAMS } from '../../constants/aiModels';
import { formatDateTimeContext } from '../../utils/dateTime';

interface CacheEntry {
  result: WebSearchResult;
  expiry: Date;
}

/**
 * Perplexity-based web search tool with smart routing and caching
 */
export class PerplexityWebSearchTool implements IWebSearchTool {
  public readonly name = 'PerplexityWebSearchTool';
  public readonly version = '1.0.0';
  public readonly description = 'Web search tool with basic and advanced modes using Perplexity AI';

  private openrouter;
  private perplexityModel;
  private basicModel;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(private apiKey: string) {
    this.openrouter = createOpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer': 'https://telegrambot.ai',
        'X-Title': 'Telegram AI Agent',
      },
    });
    
    this.perplexityModel = this.openrouter(MODEL_CONFIG.WEB_SEARCH.ADVANCED);
    this.basicModel = this.openrouter(MODEL_CONFIG.WEB_SEARCH.BASIC);
  }

  /**
   * Main search method with smart routing
   */
  async search(query: string, userTimezone?: string): Promise<WebSearchResult> {
    try {
      const cacheKey = `${query.toLowerCase().trim()}_${userTimezone || 'UTC'}`;
      
      // Check cache first
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Classify query and route to appropriate search
      const classification = this.classifySearchQuery(query);
      console.log(`📊 Query classification: ${classification.type} (confidence: ${classification.confidence})`);
      console.log(`📝 Reasoning: ${classification.reasoning}`);

      let result: WebSearchResult;

      if (classification.type === 'advanced') {
        result = await this.performAdvancedSearch(query, userTimezone);
      } else {
        result = await this.performBasicSearch(query, userTimezone);
      }

      // Cache the result
      this.setCachedResult(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in web search:', error);
      return this.createFallbackResult(query);
    }
  }

  /**
   * Force basic search
   */
  async basicSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    console.log(`💰 Forcing BASIC search for: ${query}`);
    return await this.performBasicSearch(query, userTimezone);
  }

  /**
   * Force advanced search
   */
  async advancedSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    console.log(`🚀 Forcing ADVANCED search for: ${query}`);
    return await this.performAdvancedSearch(query, userTimezone);
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
   * Classify search query for routing
   */
  private classifySearchQuery(query: string): SearchClassification {
    const lowerQuery = query.toLowerCase();
    
    // Critical queries requiring real-time search (advanced)
    const advancedPatterns = [
      /breaking news|срочные новости|breaking|urgent|срочно/,
      /live|прямой эфир|онлайн|real.?time|в реальном времени/,
      /emergency|чрезвычайная ситуация|авария|катастрофа/,
    ];

    for (const pattern of advancedPatterns) {
      if (pattern.test(lowerQuery)) {
        return {
          type: 'advanced',
          confidence: 0.9,
          reasoning: 'Critical query requiring real-time search'
        };
      }
    }

    // Default to basic for cost optimization
    return {
      type: 'basic',
      confidence: 0.8,
      reasoning: 'Default basic search for cost optimization'
    };
  }

  /**
   * Perform basic search
   */
  private async performBasicSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    console.log(`🔍 Performing BASIC search for: ${query}`);

    const dateTimeContext = formatDateTimeContext(userTimezone);
    const searchPrompt = AI_PROMPTS.WEB_SEARCH.BASIC_SEARCH_PROMPT(query, dateTimeContext);

    const { text } = await generateText({
      model: this.basicModel,
      prompt: searchPrompt,
      maxTokens: MODEL_PARAMS.WEB_SEARCH.BASIC.MAX_TOKENS,
      temperature: MODEL_PARAMS.WEB_SEARCH.BASIC.TEMPERATURE,
    });

    return {
      query,
      results: text + '\n\n💡 *Note: This is a basic search. For real-time information, try asking again with more specific current context.*',
      timestamp: new Date(),
    };
  }

  /**
   * Perform advanced search with Perplexity
   */
  private async performAdvancedSearch(query: string, userTimezone?: string): Promise<WebSearchResult> {
    console.log(`🔍 Performing ADVANCED search (Perplexity) for: ${query}`);

    const dateTimeContext = formatDateTimeContext(userTimezone);
    const systemPrompt = AI_PROMPTS.WEB_SEARCH.ADVANCED_SEARCH_SYSTEM(dateTimeContext);
    const userPrompt = AI_PROMPTS.WEB_SEARCH.ADVANCED_SEARCH_PROMPT(query);

    const { text } = await generateText({
      model: this.perplexityModel,
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: MODEL_PARAMS.WEB_SEARCH.ADVANCED.MAX_TOKENS,
      temperature: MODEL_PARAMS.WEB_SEARCH.ADVANCED.TEMPERATURE,
    });

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
      `Sorry, couldn't perform search for "${query}". I recommend checking current information from specialized sources.` :
      `Sorry, I couldn't perform a search for "${query}". I recommend checking current information from specialized sources.`;
    
    return {
      query,
      results: fallbackMessage,
      timestamp: new Date(),
    };
  }
} 