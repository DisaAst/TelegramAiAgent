/**
 * AI Model configurations and constants
 */
export const AI_MODELS = {
  // Google Gemini models
  GEMINI: {
    FLASH_2_0: 'gemini-2.0-flash-exp',
    FLASH_2_5: 'gemini-2.5-flash',
    PRO_2_5: 'gemini-2.5-pro',
  },

  // Perplexity models for web search
  PERPLEXITY: {
    SONAR_LARGE: 'perplexity/llama-3.1-sonar-large-128k-online',
    SONAR_SMALL: 'perplexity/llama-3.1-sonar-small-128k-online',
  },

  // OpenAI models (via OpenRouter)
  OPENAI: {
    GPT_4O: 'openai/gpt-4o',
    GPT_4O_MINI: 'openai/gpt-4o-mini',
    GPT_3_5_TURBO: 'openai/gpt-3.5-turbo',
  },
} as const;

/**
 * Model usage configuration
 */
export const MODEL_CONFIG = {
  // Main text processing
  TEXT_AGENT: AI_MODELS.GEMINI.PRO_2_5,
  
  // Audio processing
  AUDIO_AGENT: AI_MODELS.GEMINI.FLASH_2_5,
  
  // Image processing
  IMAGE_AGENT: AI_MODELS.GEMINI.FLASH_2_5,
  
  // Web search models
  WEB_SEARCH: {
    BASIC: AI_MODELS.PERPLEXITY.SONAR_LARGE,
    ADVANCED: AI_MODELS.PERPLEXITY.SONAR_LARGE,
  },
} as const;

/**
 * Model parameters
 */
export const MODEL_PARAMS = {
  TEXT_GENERATION: {
    MAX_TOKENS: 10000,
    TEMPERATURE: 0.7,
    MAX_STEPS: 5,
  },
  
  IMAGE_ANALYSIS: {
    MAX_TOKENS: 10000,
    TEMPERATURE: 1.0,
    TOP_P: 0.95,
    MAX_STEPS: 5,
  },
  
  WEB_SEARCH: {
    BASIC: {
      MAX_TOKENS: 6000,
      TEMPERATURE: 0.3,
    },
    ADVANCED: {
      MAX_TOKENS: 10000,
      TEMPERATURE: 0.1,
    },
  },
} as const; 