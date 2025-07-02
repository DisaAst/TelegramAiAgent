import { WebSearchResult } from '../types';

/**
 * Base interface for all AI tools
 */
export interface ITool {
  readonly name: string;
  readonly version: string;
  readonly description: string;
}

/**
 * Interface for web search tools
 */
export interface IWebSearchTool extends ITool {
  /**
   * Search the web for information
   * @param query - Search query
   * @param userTimezone - User timezone for context
   * @returns Search results
   */
  search(query: string, userTimezone?: string): Promise<WebSearchResult>;

  /**
   * Perform basic (cost-effective) search
   * @param query - Search query
   * @param userTimezone - User timezone for context
   * @returns Search results
   */
  basicSearch(query: string, userTimezone?: string): Promise<WebSearchResult>;

  /**
   * Perform advanced (high-quality) search
   * @param query - Search query
   * @param userTimezone - User timezone for context
   * @returns Search results
   */
  advancedSearch(query: string, userTimezone?: string): Promise<WebSearchResult>;

  /**
   * Check if web search is needed for a query
   * @param prompt - User prompt
   * @returns True if search is recommended
   */
  isSearchNeeded(prompt: string): Promise<boolean>;

  /**
   * Clean expired cache entries
   */
  cleanCache(): void;

  /**
   * Get cache statistics
   * @returns Cache stats
   */
  getCacheStats(): { totalEntries: number; validEntries: number };
}

/**
 * Search classification result
 */
export interface SearchClassification {
  type: 'basic' | 'advanced';
  confidence: number;
  reasoning: string;
} 