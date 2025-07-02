export interface IContainer {
  bind<T>(token: symbol, factory: () => T): void;
  get<T>(token: symbol): T;
  resolve<T>(factory: new (...args: any[]) => T): T;
}

export interface IDependency {
  token: symbol;
  factory: () => any;
}

// Service tokens
export const TOKENS = {
  // Configuration
  Config: Symbol('Config'),
  
  // Core services
  ChatHistoryService: Symbol('ChatHistoryService'),
  UserSettingsService: Symbol('UserSettingsService'),
  
  // AI services
  AIService: Symbol('AIService'),
  AudioAgent: Symbol('AudioAgent'),
  ImageAgent: Symbol('ImageAgent'),
  TextAgent: Symbol('TextAgent'),
  MultimediaAgent: Symbol('MultimediaAgent'),
  
  // Tools
  WebSearchTool: Symbol('WebSearchTool'),
  
  // Infrastructure
  MediaProcessor: Symbol('MediaProcessor'),
  TelegramBot: Symbol('TelegramBot'),
  
  // Utils
  DateTimeUtils: Symbol('DateTimeUtils'),
  MediaConverter: Symbol('MediaConverter'),
} as const; 