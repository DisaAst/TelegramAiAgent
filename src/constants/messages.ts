export const BOT_MESSAGES = {
  WELCOME: {
    GREETING: '🤖 Hello! I\'m a smart AI assistant with cost-effective search and multimedia capabilities.',
    FEATURES_TITLE: '✨ *Features:*',
    FEATURES: [
      '• 🧠 Answers to any questions (Google Gemini)',
      '• 💰 Cost-effective web search for most queries (GPT-3.5)',
      '• 🚀 Advanced real-time search for critical information (Perplexity)',
      '• 🎤 Voice message processing',
      '• 🖼️ Image analysis and description',
      '• 💭 Memory of recent messages for context',
      '• 🕐 Current date/time awareness',
      '• 🎯 Smart caching for frequently asked questions'
    ],
    COMMANDS_TITLE: '*Commands:*',
    COMMANDS: [
      '/help - Detailed help',
      '/timezone - Set your timezone',
      '/time - Show current time',
      '/history - Show chat history',
      '/clear - Clear history',
      '/stats - Statistics + search info',
      '/clearcache - Clean search cache'
    ],
    USAGE_TITLE: 'You can:',
    USAGE: [
      '• Send text messages',
      '• Send voice messages for transcription',
      '• Send images for analysis',
      '• Combine text with images for detailed questions'
    ]
  },

  HELP: {
    TITLE: '🤖 *Smart AI Assistant with Multimedia Support*',
    HOW_IT_WORKS_TITLE: '*🔄 How it works:*',
    HOW_IT_WORKS: [
      '• I answer regular questions using Google Gemini',
      '• Use basic search (GPT-3.5) for most web queries (cost-effective)',
      '• Use advanced search (Perplexity) only for critical/urgent information',
      '• Process voice messages and transcribe them',
      '• Analyze images and answer questions about them',
      '• Remember context from recent messages',
      '• Aware of current date and time'
    ],
    SEARCH_SYSTEM_TITLE: '*🔍 Search System:*',
    SEARCH_SYSTEM: [
      '• 💰 Basic Search (default): Cost-effective, good for most queries',
      '• 🚀 Advanced Search: Real-time Perplexity for urgent/critical queries',
      '• 🎯 Cached Results: 30-minute cache for frequently asked questions'
    ],
    HISTORY_TITLE: '*📚 History Management:*',
    HISTORY: [
      '• /history - Show recent messages',
      '• /clear - Clear chat history',
      '• /stats - Usage statistics + search stats',
      '• /clearcache - Clean search cache'
    ],
    TIME_TITLE: '*🕐 Time & Timezone:*',
    TIME: [
      '• /time - Show current time',
      '• /timezone - Set your timezone',
      '• /timezone list - Popular timezones'
    ],
    MULTIMEDIA_TITLE: '*🎯 Multimedia Features:*',
    MULTIMEDIA: [
      '• 🎤 Voice messages - Send voice note for transcription',
      '• 🖼️ Images - Send photo for analysis',
      '• 📝 Combined - Send image with text question',
      '• 🔍 Search - AI can search web if needed'
    ],
    EXAMPLES_TITLE: '*💡 Examples:*',
    EXAMPLES: [
      '• "What\'s in this image?" + photo',
      '• Voice: "What\'s the weather today?"',
      '• "Explain this code" + screenshot',
      '• "Breaking news today" → advanced search',
      '• "What is Python?" → basic search'
    ]
  },

  TIMEZONE: {
    CURRENT_TITLE: '🕐 *Your timezone settings:*',
    CURRENT_TIMEZONE: 'Current timezone: {timezone}',
    LOCAL_TIME: 'Your local time: {time}',
    USAGE_TITLE: '*Usage:*',
    USAGE: [
      '• /timezone Europe/Moscow - Set Moscow time',
      '• /timezone list - Show popular timezones',
      '• /timezone reset - Reset to UTC'
    ],
    POPULAR_TITLE: '🌍 *Popular timezones:*',
    POPULAR_USAGE: '*Usage:* /timezone Europe/Moscow',
    RESET_SUCCESS: '🔄 Timezone reset to UTC',
    SET_SUCCESS: '✅ Timezone set to: {timezone}',
    INVALID_TIMEZONE: '❌ Invalid timezone: {timezone}\n\nUse /timezone list to see available options.'
  },

  TIME: {
    TITLE: '🕐 *Current time:*',
    YOUR_TIME: 'Your time: {time}',
    UTC_TIME: 'UTC time: {utc}',
    DAY: 'Day: {day}',
    TIMEZONE: 'Timezone: {timezone}'
  },

  HISTORY: {
    EMPTY: '📝 History is empty. Start a conversation!',
    TITLE: '📚 *Chat history ({count} messages):*'
  },

  STATS: {
    TITLE: '📊 *Statistics:*',
    ACTIVE_CHATS: '• Active chats: {count}',
    TOTAL_MESSAGES: '• Total messages: {count}',
    MEDIA_MESSAGES: '• Media messages: {count}',
    HISTORY_LIMIT: '• History limit: {limit} messages',
    USERS_WITH_TIMEZONE: '• Users with custom timezone: {count}',
    SEARCH_TITLE: '🔍 *Search Statistics:*',
    SEARCH_CACHE_ENTRIES: '• Search cache entries: {total}',
    SEARCH_VALID_ENTRIES: '• Valid cache entries: {valid}',
    SEARCH_BASIC: '• Basic search (default): GPT-3.5-turbo',
    SEARCH_ADVANCED: '• Advanced search: Perplexity (for urgent/critical queries)',
    AI_MODELS_TITLE: '🤖 *AI Models:*',
    AI_MAIN: '• Main: Google Gemini 2.0 Flash',
    AI_SEARCH: '• Search: Basic by default, Advanced for critical queries'
  },

  CACHE: {
    CLEANED_TITLE: '🧹 *Search cache cleaned!*',
    REMAINING_ENTRIES: 'Remaining entries: {total}',
    VALID_ENTRIES: 'Valid entries: {valid}'
  },

  PROCESSING: {
    TRANSCRIBING_VOICE: '🎤 Transcribing voice message...',
    PROCESSING_AUDIO: '🎵 Processing audio file...',
    ANALYZING_IMAGE: '🖼️ Analyzing image...'
  },

  ERRORS: {
    USER_NOT_IDENTIFIED: '❌ Could not identify user.',
    CHAT_NOT_IDENTIFIED: '❌ Could not identify user or chat.',
    VOICE_TRANSCRIPTION_FAILED: '❌ Sorry, I couldn\'t transcribe your voice message. Please try again or send a text message.',
    AUDIO_PROCESSING_FAILED: '❌ Sorry, I couldn\'t process your audio file. Please try again or send a text message.',
    IMAGE_ANALYSIS_FAILED: '❌ Sorry, I couldn\'t analyze your image. Please try again or describe what\'s in the image.',
    GENERAL_ERROR: '❌ Sorry, I can\'t process your request right now. Please try again later.',
    CACHE_CLEAN_FAILED: '❌ Failed to clean cache'
  },

  EMOJIS: {
    BRAIN: '🧠',
    SEARCH: '🔍',
    VOICE: '🎤',
    IMAGE: '🖼️',
    AUDIO: '��'
  }
} as const; 