import { Telegraf, Context } from 'telegraf';
import { IConfig } from '../../config/Config';
import { IAIService } from '../../services/AIService';
import { IChatHistoryService } from '../../services/ChatHistoryService';
import { IUserSettingsService } from '../../services/UserSettingsService';
import { IWebSearchTool } from '../../tools/interfaces';
import { IMediaProcessor } from '../../infrastructure/MediaProcessor';
import { MessageFormatter } from '../../utils/messageFormatter';
import { BOT_MESSAGES } from '../../constants/messages';
import { getCurrentDateTime } from '../../utils/dateTime';
import { MultimediaRequest } from '../../agents/interfaces';

/**
 * Interface for Telegram bot
 */
export interface ITelegramBot {
  start(): void;
  stop(): void;
}

/**
 * Modular Telegram bot implementation with dependency injection
 */
export class TelegramBot implements ITelegramBot {
  private bot: Telegraf;

  constructor(
    private config: IConfig,
    private aiService: IAIService,
    private chatHistoryService: IChatHistoryService,
    private userSettingsService: IUserSettingsService,
    private webSearchTool: IWebSearchTool,
    private mediaProcessor: IMediaProcessor
  ) {
    this.bot = new Telegraf(config.telegramBotToken);
    this.setupHandlers();
  }

  /**
   * Setup bot command and message handlers
   */
  private setupHandlers(): void {
    // Start command
    this.bot.start((ctx) => {
      const welcomeMessage = MessageFormatter.buildMessage(
        BOT_MESSAGES.WELCOME.GREETING,
        [
          BOT_MESSAGES.WELCOME.FEATURES_TITLE,
          ...BOT_MESSAGES.WELCOME.FEATURES,
          '',
          BOT_MESSAGES.WELCOME.COMMANDS_TITLE,
          ...BOT_MESSAGES.WELCOME.COMMANDS,
          '',
          BOT_MESSAGES.WELCOME.USAGE_TITLE,
          ...BOT_MESSAGES.WELCOME.USAGE
        ]
      );
      ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Text handler
    this.bot.on('text', (ctx) => this.handleTextMessage(ctx));

    // Error handler
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      ctx.reply(BOT_MESSAGES.ERRORS.GENERAL_ERROR);
    });
  }

  /**
   * Handle text messages
   */
  private async handleTextMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) return;

    const message = ctx.message.text;
    const userId = ctx.from?.id;
    const userName = ctx.from?.username || ctx.from?.first_name;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    try {
      await ctx.sendChatAction('typing');

      this.chatHistoryService.addUserMessage(chatId, message, userId, userName);
      const history = this.chatHistoryService.getRecentHistory(chatId);
      const aiResponse = await this.aiService.generateResponse(message, history, userId);

      const cleanedText = MessageFormatter.cleanForTelegram(aiResponse.text);
      const searchEmoji = aiResponse.usedWebSearch ? BOT_MESSAGES.EMOJIS.SEARCH : BOT_MESSAGES.EMOJIS.BRAIN;
      const responseText = `${searchEmoji} ${cleanedText}`;

      await ctx.reply(responseText);
      this.chatHistoryService.addAssistantMessage(chatId, aiResponse.text);

      if (this.config.isDev) {
        const userTimezone = this.userSettingsService.getUserTimezone(userId);
        console.log(`User ${userName} (${userId}) [${userTimezone || 'UTC'}]: ${message}`);
        console.log(`AI Response (${aiResponse.usedWebSearch ? 'with search' : 'direct'}): ${aiResponse.text}`);
        console.log(`Steps: ${aiResponse.steps}, History length: ${history.length}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await ctx.reply(BOT_MESSAGES.ERRORS.GENERAL_ERROR);
    }
  }

  /**
   * Start the bot
   */
  public start(): void {
    console.log('🚀 Telegram bot is starting...');
    this.bot.launch();
    
    // Graceful shutdown
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    
    console.log('✅ Telegram bot is running!');
  }

  /**
   * Stop the bot
   */
  public stop(): void {
    this.bot.stop();
    console.log('🛑 Telegram bot stopped');
  }
} 