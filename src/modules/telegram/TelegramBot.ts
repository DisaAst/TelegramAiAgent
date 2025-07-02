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

    // Help command
    this.bot.help((ctx) => this.handleHelpCommand(ctx));

    // Timezone commands
    this.bot.command('timezone', (ctx) => this.handleTimezoneCommand(ctx));
    this.bot.command('time', (ctx) => this.handleTimeCommand(ctx));

    // History commands
    this.bot.command('history', (ctx) => this.handleHistoryCommand(ctx));
    this.bot.command('clear', (ctx) => this.handleClearCommand(ctx));

    // Stats and cache commands
    this.bot.command('stats', (ctx) => this.handleStatsCommand(ctx));
    this.bot.command('clearcache', (ctx) => this.handleClearCacheCommand(ctx));

    // Voice message handler
    this.bot.on('voice', (ctx) => this.handleVoiceMessage(ctx));

    // Audio file handler
    this.bot.on('audio', (ctx) => this.handleAudioMessage(ctx));

    // Photo handler
    this.bot.on('photo', (ctx) => this.handlePhotoMessage(ctx));

    // Document handler (for images sent as files)
    this.bot.on('document', (ctx) => this.handleDocumentMessage(ctx));

    // Text handler
    this.bot.on('text', (ctx) => this.handleTextMessage(ctx));

    // Error handler
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      ctx.reply(BOT_MESSAGES.ERRORS.GENERAL_ERROR);
    });
  }

  /**
   * Handle voice messages
   */
  private async handleVoiceMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('voice' in ctx.message)) return;

    const userId = ctx.from?.id;
    const userName = ctx.from?.username || ctx.from?.first_name;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    try {
      await ctx.sendChatAction('typing');
      await ctx.reply(BOT_MESSAGES.PROCESSING.TRANSCRIBING_VOICE);

      const voice = ctx.message.voice;
      const audioData = await this.mediaProcessor.processAudio(voice.file_id, voice.mime_type);
      
      const userTimezone = this.userSettingsService.getUserTimezone(userId);
      const transcription = await this.aiService.transcribeAudio(audioData, userTimezone);

      // Add to history
      this.chatHistoryService.addUserMessage(
        chatId, 
        transcription, 
        userId, 
        userName, 
        'audio', 
        audioData
      );

      const history = this.chatHistoryService.getRecentHistory(chatId);
      const aiResponse = await this.aiService.generateResponse(transcription, history, userId);

      const responseEmoji = aiResponse.usedWebSearch ? BOT_MESSAGES.EMOJIS.SEARCH : BOT_MESSAGES.EMOJIS.BRAIN;
      const responseText = `${BOT_MESSAGES.EMOJIS.VOICE} *Transcription:* ${transcription}\n\n${responseEmoji} ${aiResponse.text}`;
      
      const formatResult = MessageFormatter.safeFormat(responseText);
      await ctx.reply(formatResult.text, formatResult.parse_mode ? { parse_mode: formatResult.parse_mode } : {});
      this.chatHistoryService.addAssistantMessage(chatId, aiResponse.text);

      if (this.config.isDev) {
        console.log(`Voice from ${userName} (${userId}): ${transcription}`);
        console.log(`AI Response: ${aiResponse.text}`);
      }
    } catch (error) {
      console.error('Error handling voice message:', error);
      await ctx.reply(BOT_MESSAGES.ERRORS.VOICE_TRANSCRIPTION_FAILED);
    }
  }

  /**
   * Handle audio files
   */
  private async handleAudioMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('audio' in ctx.message)) return;

    const userId = ctx.from?.id;
    const userName = ctx.from?.username || ctx.from?.first_name;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    try {
      await ctx.sendChatAction('typing');
      await ctx.reply(BOT_MESSAGES.PROCESSING.PROCESSING_AUDIO);

      const audio = ctx.message.audio;
      const audioData = await this.mediaProcessor.processAudio(audio.file_id, audio.mime_type);
      
      const userTimezone = this.userSettingsService.getUserTimezone(userId);
      const transcription = await this.aiService.transcribeAudio(audioData, userTimezone);

      // Add to history
      this.chatHistoryService.addUserMessage(
        chatId, 
        transcription, 
        userId, 
        userName, 
        'audio', 
        audioData
      );

      const history = this.chatHistoryService.getRecentHistory(chatId);
      const aiResponse = await this.aiService.generateResponse(transcription, history, userId);

      const responseEmoji = aiResponse.usedWebSearch ? BOT_MESSAGES.EMOJIS.SEARCH : BOT_MESSAGES.EMOJIS.BRAIN;
      const responseText = `${BOT_MESSAGES.EMOJIS.AUDIO} *Audio processed:* ${transcription}\n\n${responseEmoji} ${aiResponse.text}`;
      
      const formatResult = MessageFormatter.safeFormat(responseText);
      await ctx.reply(formatResult.text, formatResult.parse_mode ? { parse_mode: formatResult.parse_mode } : {});
      this.chatHistoryService.addAssistantMessage(chatId, aiResponse.text);

      if (this.config.isDev) {
        console.log(`Audio from ${userName} (${userId}): ${transcription}`);
        console.log(`AI Response: ${aiResponse.text}`);
      }
    } catch (error) {
      console.error('Error handling audio message:', error);
      await ctx.reply(BOT_MESSAGES.ERRORS.AUDIO_PROCESSING_FAILED);
    }
  }

  /**
   * Handle photo messages
   */
  private async handlePhotoMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('photo' in ctx.message)) return;

    const userId = ctx.from?.id;
    const userName = ctx.from?.username || ctx.from?.first_name;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    try {
      await ctx.sendChatAction('typing');
      await ctx.reply(BOT_MESSAGES.PROCESSING.ANALYZING_IMAGE);

      // Get the largest photo size
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const imageData = await this.mediaProcessor.processImage(photo.file_id);
      
      // Get caption if provided
      const caption = 'caption' in ctx.message ? ctx.message.caption : undefined;
      const userTimezone = this.userSettingsService.getUserTimezone(userId);
      
      const aiResponse = await this.aiService.analyzeImage(imageData, caption, userTimezone);

      // Add to history
      const historyText = caption || 'User sent an image';
      this.chatHistoryService.addUserMessage(
        chatId, 
        historyText, 
        userId, 
        userName, 
        'image', 
        imageData
      );

      const responseEmoji = aiResponse.usedWebSearch ? BOT_MESSAGES.EMOJIS.SEARCH : BOT_MESSAGES.EMOJIS.BRAIN;
      const responseText = `${BOT_MESSAGES.EMOJIS.IMAGE} ${aiResponse.text}`;
      
      const formatResult = MessageFormatter.safeFormat(responseText);
      await ctx.reply(formatResult.text, formatResult.parse_mode ? { parse_mode: formatResult.parse_mode } : {});
      this.chatHistoryService.addAssistantMessage(chatId, aiResponse.text);

      if (this.config.isDev) {
        console.log(`Image from ${userName} (${userId}): ${caption || 'no caption'}`);
        console.log(`AI Response: ${aiResponse.text}`);
      }
    } catch (error) {
      console.error('Error handling photo message:', error);
      await ctx.reply(BOT_MESSAGES.ERRORS.IMAGE_ANALYSIS_FAILED);
    }
  }

  /**
   * Handle document messages (images sent as files)
   */
  private async handleDocumentMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('document' in ctx.message)) return;

    const document = ctx.message.document;
    
    // Check if it's an image document
    if (!document.mime_type?.startsWith('image/')) {
      return; // Skip non-image documents
    }

    const userId = ctx.from?.id;
    const userName = ctx.from?.username || ctx.from?.first_name;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    try {
      await ctx.sendChatAction('typing');
      await ctx.reply(BOT_MESSAGES.PROCESSING.ANALYZING_IMAGE);

      const imageData = await this.mediaProcessor.processImage(document.file_id, document.mime_type);
      
      // Get caption if provided
      const caption = 'caption' in ctx.message ? ctx.message.caption : undefined;
      const userTimezone = this.userSettingsService.getUserTimezone(userId);
      
      const aiResponse = await this.aiService.analyzeImage(imageData, caption, userTimezone);

      // Add to history
      const historyText = caption || 'User sent an image document';
      this.chatHistoryService.addUserMessage(
        chatId, 
        historyText, 
        userId, 
        userName, 
        'image', 
        imageData
      );

      const responseEmoji = aiResponse.usedWebSearch ? BOT_MESSAGES.EMOJIS.SEARCH : BOT_MESSAGES.EMOJIS.BRAIN;
      const responseText = `${BOT_MESSAGES.EMOJIS.IMAGE} ${aiResponse.text}`;
      
      const formatResult = MessageFormatter.safeFormat(responseText);
      await ctx.reply(formatResult.text, formatResult.parse_mode ? { parse_mode: formatResult.parse_mode } : {});
      this.chatHistoryService.addAssistantMessage(chatId, aiResponse.text);

      if (this.config.isDev) {
        console.log(`Image document from ${userName} (${userId}): ${caption || 'no caption'}`);
        console.log(`AI Response: ${aiResponse.text}`);
      }
    } catch (error) {
      console.error('Error handling document message:', error);
      await ctx.reply(BOT_MESSAGES.ERRORS.IMAGE_ANALYSIS_FAILED);
    }
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

      const searchEmoji = aiResponse.usedWebSearch ? BOT_MESSAGES.EMOJIS.SEARCH : BOT_MESSAGES.EMOJIS.BRAIN;
      const responseText = `${searchEmoji} ${aiResponse.text}`;
      
      const formatResult = MessageFormatter.safeFormat(responseText);
      await ctx.reply(formatResult.text, formatResult.parse_mode ? { parse_mode: formatResult.parse_mode } : {});
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
   * Handle help command
   */
  private async handleHelpCommand(ctx: Context): Promise<void> {
    const helpMessage = MessageFormatter.buildMessage(
      BOT_MESSAGES.HELP.TITLE,
      [
        BOT_MESSAGES.HELP.HOW_IT_WORKS_TITLE,
        ...BOT_MESSAGES.HELP.HOW_IT_WORKS,
        '',
        BOT_MESSAGES.HELP.SEARCH_SYSTEM_TITLE,
        ...BOT_MESSAGES.HELP.SEARCH_SYSTEM,
        '',
        BOT_MESSAGES.HELP.HISTORY_TITLE,
        ...BOT_MESSAGES.HELP.HISTORY,
        '',
        BOT_MESSAGES.HELP.TIME_TITLE,
        ...BOT_MESSAGES.HELP.TIME,
        '',
        BOT_MESSAGES.HELP.MULTIMEDIA_TITLE,
        ...BOT_MESSAGES.HELP.MULTIMEDIA,
        '',
        BOT_MESSAGES.HELP.EXAMPLES_TITLE,
        ...BOT_MESSAGES.HELP.EXAMPLES
      ]
    );
    ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle timezone command
   */
  private async handleTimezoneCommand(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      ctx.reply(BOT_MESSAGES.ERRORS.USER_NOT_IDENTIFIED);
      return;
    }

    const args = ctx.message && 'text' in ctx.message ? 
      ctx.message.text.split(' ').slice(1) : [];

    if (args.length === 0) {
      // Show current timezone
      const currentTimezone = this.userSettingsService.getUserTimezone(userId) || 'UTC';
      const dateTime = getCurrentDateTime(currentTimezone);
      
      const message = MessageFormatter.buildMessage(
        BOT_MESSAGES.TIMEZONE.CURRENT_TITLE,
        [
          MessageFormatter.format(BOT_MESSAGES.TIMEZONE.CURRENT_TIMEZONE, { timezone: currentTimezone }),
          MessageFormatter.format(BOT_MESSAGES.TIMEZONE.LOCAL_TIME, { time: dateTime.currentDateTime }),
          '',
          BOT_MESSAGES.TIMEZONE.USAGE_TITLE,
          ...BOT_MESSAGES.TIMEZONE.USAGE
        ]
      );
      ctx.reply(message, { parse_mode: 'Markdown' });
    } else if (args[0] === 'list') {
      // Show popular timezones
      const popularTimezones = this.userSettingsService.getPopularTimezones();
      const timezoneList = popularTimezones.map(tz => `• ${tz}`);
      
      const message = MessageFormatter.buildMessage(
        BOT_MESSAGES.TIMEZONE.POPULAR_TITLE,
        [
          ...timezoneList,
          '',
          BOT_MESSAGES.TIMEZONE.POPULAR_USAGE
        ]
      );
      ctx.reply(message, { parse_mode: 'Markdown' });
    } else if (args[0] === 'reset') {
      // Reset timezone to UTC
      this.userSettingsService.setUserTimezone(userId, 'UTC');
      ctx.reply(BOT_MESSAGES.TIMEZONE.RESET_SUCCESS);
    } else {
      // Set new timezone
      const timezone = args[0];
      const success = this.userSettingsService.setUserTimezone(userId, timezone);
      
      if (success) {
        const message = MessageFormatter.format(BOT_MESSAGES.TIMEZONE.SET_SUCCESS, { timezone });
        ctx.reply(message);
      } else {
        const message = MessageFormatter.format(BOT_MESSAGES.TIMEZONE.INVALID_TIMEZONE, { timezone });
        ctx.reply(message);
      }
    }
  }

  /**
   * Handle time command
   */
  private async handleTimeCommand(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      ctx.reply(BOT_MESSAGES.ERRORS.USER_NOT_IDENTIFIED);
      return;
    }

    const userTimezone = this.userSettingsService.getUserTimezone(userId) || 'UTC';
    const dateTime = getCurrentDateTime(userTimezone);
    
    const message = MessageFormatter.buildMessage(
      BOT_MESSAGES.TIME.TITLE,
      [
        MessageFormatter.format(BOT_MESSAGES.TIME.YOUR_TIME, { time: dateTime.currentDateTime }),
        MessageFormatter.format(BOT_MESSAGES.TIME.UTC_TIME, { utc: dateTime.utcDateTime }),
        MessageFormatter.format(BOT_MESSAGES.TIME.DAY, { day: dateTime.dayOfWeek }),
        MessageFormatter.format(BOT_MESSAGES.TIME.TIMEZONE, { timezone: dateTime.timezone })
      ]
    );
    ctx.reply(message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle history command
   */
  private async handleHistoryCommand(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id;
    
    if (!chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    const history = this.chatHistoryService.getRecentHistory(chatId);
    
    if (history.length === 0) {
      ctx.reply(BOT_MESSAGES.HISTORY.EMPTY);
      return;
    }

    const historyItems = history.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const mediaIndicator = msg.mediaType === 'image' ? ' 🖼️' : 
                            msg.mediaType === 'audio' ? ' 🎵' : '';
      const timestamp = msg.timestamp.toLocaleTimeString();
      return `${timestamp} - ${role}${mediaIndicator}: ${msg.text}`;
    });

    const message = MessageFormatter.buildMessage(
      MessageFormatter.format(BOT_MESSAGES.HISTORY.TITLE, { count: history.length }),
      historyItems
    );
    ctx.reply(message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle clear command
   */
  private async handleClearCommand(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id;
    
    if (!chatId) {
      ctx.reply(BOT_MESSAGES.ERRORS.CHAT_NOT_IDENTIFIED);
      return;
    }

    this.chatHistoryService.clearHistory(chatId);
    ctx.reply('🧹 Chat history cleared!');
  }

  /**
   * Handle stats command
   */
  private async handleStatsCommand(ctx: Context): Promise<void> {
    const chatStats = this.chatHistoryService.getChatStats();
    const settingsStats = this.userSettingsService.getSettingsStats();
    const cacheStats = this.webSearchTool.getCacheStats();

    const message = MessageFormatter.buildMessage(
      BOT_MESSAGES.STATS.TITLE,
      [
        MessageFormatter.format(BOT_MESSAGES.STATS.ACTIVE_CHATS, { count: chatStats.totalChats }),
        MessageFormatter.format(BOT_MESSAGES.STATS.TOTAL_MESSAGES, { count: chatStats.totalMessages }),
        MessageFormatter.format(BOT_MESSAGES.STATS.MEDIA_MESSAGES, { count: chatStats.mediaMessages }),
        MessageFormatter.format(BOT_MESSAGES.STATS.HISTORY_LIMIT, { limit: this.config.chatHistoryLimit }),
        MessageFormatter.format(BOT_MESSAGES.STATS.USERS_WITH_TIMEZONE, { count: settingsStats.usersWithTimezone }),
        '',
        BOT_MESSAGES.STATS.SEARCH_TITLE,
        MessageFormatter.format(BOT_MESSAGES.STATS.SEARCH_CACHE_ENTRIES, { total: cacheStats.totalEntries }),
        MessageFormatter.format(BOT_MESSAGES.STATS.SEARCH_VALID_ENTRIES, { valid: cacheStats.validEntries }),
        BOT_MESSAGES.STATS.SEARCH_GROUNDING,
        '',
        BOT_MESSAGES.STATS.AI_MODELS_TITLE,
        BOT_MESSAGES.STATS.AI_MAIN,
        BOT_MESSAGES.STATS.AI_SEARCH
      ]
    );
    ctx.reply(message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle clear cache command
   */
  private async handleClearCacheCommand(ctx: Context): Promise<void> {
    try {
      this.webSearchTool.cleanCache();
      const cacheStats = this.webSearchTool.getCacheStats();
      
      const message = MessageFormatter.buildMessage(
        BOT_MESSAGES.CACHE.CLEANED_TITLE,
        [
          MessageFormatter.format(BOT_MESSAGES.CACHE.REMAINING_ENTRIES, { total: cacheStats.totalEntries }),
          MessageFormatter.format(BOT_MESSAGES.CACHE.VALID_ENTRIES, { valid: cacheStats.validEntries })
        ]
      );
      ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error cleaning cache:', error);
      ctx.reply(BOT_MESSAGES.ERRORS.CACHE_CLEAN_FAILED);
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