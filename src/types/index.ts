export interface ChatMessage {
  id: string;
  text: string;
  userId: number;
  userName?: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  mediaType?: 'text' | 'image' | 'audio';
  mediaData?: MediaContent;
}

export interface MediaContent {
  data: ArrayBuffer;
  mimeType: string;
  fileSize: number;
  fileName?: string;
}

export interface TelegramMessage {
  message_id: number;
  text: string;
  from?: {
    id: number;
    username?: string;
    first_name?: string;
    is_bot?: boolean;
  };
  date: number;
}

export interface AIResponse {
  text: string;
  timestamp: Date;
  usedWebSearch?: boolean;
  steps?: number;
  mediaProcessed?: boolean;
}

export interface BotContext {
  userId: number;
  userName?: string;
  chatId: number;
}

export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface WebSearchResult {
  query: string;
  results: string;
  timestamp: Date;
}

export interface MultimediaRequest {
  text?: string;
  images?: MediaContent[];
  audio?: MediaContent;
  userId?: number;
  userTimezone?: string;
} 