import { container } from './container';
import { TOKENS } from './types';

// Configuration
import { Config } from '../config/Config';

// Services
import { ChatHistoryService } from '../services/ChatHistoryService';
import { UserSettingsService } from '../services/UserSettingsService';
import { AIService } from '../services/AIService';

// Tools
import { PerplexityWebSearchTool } from '../tools/webSearch/PerplexityWebSearchTool';

// Agents
import { GeminiAudioAgent } from '../agents/audio/GeminiAudioAgent';
import { GeminiImageAgent } from '../agents/image/GeminiImageAgent';
import { GeminiTextAgent } from '../agents/text/GeminiTextAgent';
import { MultimediaAgent } from '../agents/multimedia/MultimediaAgent';

// Infrastructure
import { TelegramMediaProcessor } from '../infrastructure/MediaProcessor';

// Telegram Bot
import { TelegramBot } from '../modules/telegram/TelegramBot';

/**
 * Configure dependency injection container
 */
export function configureDI(): void {
  // Configuration
  container.bind(TOKENS.Config, () => new Config());

  // Get config for other services
  const config = container.get<Config>(TOKENS.Config);

  // Services
  container.bind(TOKENS.ChatHistoryService, () => 
    new ChatHistoryService(config.chatHistoryLimit)
  );
  
  container.bind(TOKENS.UserSettingsService, () => 
    new UserSettingsService()
  );

  // Infrastructure
  container.bind(TOKENS.MediaProcessor, () => 
    new TelegramMediaProcessor(config.telegramBotToken)
  );

  // Tools
  container.bind(TOKENS.WebSearchTool, () => 
    new PerplexityWebSearchTool(config.openrouterApiKey)
  );

  // Agents
  container.bind(TOKENS.AudioAgent, () => 
    new GeminiAudioAgent(config.geminiApiKey)
  );

  container.bind(TOKENS.ImageAgent, () => {
    const webSearchTool = container.get<PerplexityWebSearchTool>(TOKENS.WebSearchTool);
    return new GeminiImageAgent(config.geminiApiKey, webSearchTool);
  });

  container.bind(TOKENS.TextAgent, () => {
    const webSearchTool = container.get<PerplexityWebSearchTool>(TOKENS.WebSearchTool);
    return new GeminiTextAgent(config.geminiApiKey, webSearchTool, config.chatHistoryLimit);
  });

  container.bind(TOKENS.MultimediaAgent, () => {
    const audioAgent = container.get<GeminiAudioAgent>(TOKENS.AudioAgent);
    const imageAgent = container.get<GeminiImageAgent>(TOKENS.ImageAgent);
    return new MultimediaAgent(audioAgent, imageAgent);
  });

  // Main AI Service
  container.bind(TOKENS.AIService, () => {
    const textAgent = container.get<GeminiTextAgent>(TOKENS.TextAgent);
    const audioAgent = container.get<GeminiAudioAgent>(TOKENS.AudioAgent);
    const imageAgent = container.get<GeminiImageAgent>(TOKENS.ImageAgent);
    const multimediaAgent = container.get<MultimediaAgent>(TOKENS.MultimediaAgent);
    const userSettingsService = container.get<UserSettingsService>(TOKENS.UserSettingsService);
    const chatHistoryService = container.get<ChatHistoryService>(TOKENS.ChatHistoryService);
    
    return new AIService(
      textAgent,
      audioAgent,
      imageAgent,
      multimediaAgent,
      userSettingsService,
      chatHistoryService
    );
  });

  // Telegram Bot
  container.bind(TOKENS.TelegramBot, () => {
    const aiService = container.get<AIService>(TOKENS.AIService);
    const chatHistoryService = container.get<ChatHistoryService>(TOKENS.ChatHistoryService);
    const userSettingsService = container.get<UserSettingsService>(TOKENS.UserSettingsService);
    const webSearchTool = container.get<PerplexityWebSearchTool>(TOKENS.WebSearchTool);
    const mediaProcessor = container.get<TelegramMediaProcessor>(TOKENS.MediaProcessor);
    
    return new TelegramBot(
      config,
      aiService,
      chatHistoryService,
      userSettingsService,
      webSearchTool,
      mediaProcessor
    );
  });
}
 