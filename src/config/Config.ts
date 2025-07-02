import { config } from 'dotenv';

config();

/**
 * Application configuration interface
 */
export interface IConfig {
  telegramBotToken: string;
  geminiApiKey: string;
  isDev: boolean;
  chatHistoryLimit: number;
}

/**
 * Configuration implementation
 */
export class Config implements IConfig {
  public readonly telegramBotToken: string;
  public readonly geminiApiKey: string;
  public readonly isDev: boolean;
  public readonly chatHistoryLimit: number;

  constructor() {
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.isDev = process.env.NODE_ENV !== 'production';
    this.chatHistoryLimit = parseInt(process.env.CHAT_HISTORY_LIMIT || '7', 10);

    this.validate();
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    if (!this.telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    if (this.chatHistoryLimit < 1 || this.chatHistoryLimit > 20) {
      throw new Error('CHAT_HISTORY_LIMIT must be between 1 and 20');
    }
  }
} 