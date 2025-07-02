import { ChatMessage, MediaContent } from '../types';

/**
 * Interface for chat history service
 */
export interface IChatHistoryService {
  addUserMessage(
    chatId: number, 
    text: string, 
    userId: number, 
    userName?: string,
    mediaType?: 'text' | 'image' | 'audio',
    mediaData?: MediaContent
  ): void;
  
  addAssistantMessage(chatId: number, text: string): void;
  getRecentHistory(chatId: number): ChatMessage[];
  clearHistory(chatId: number): void;
  getChatStats(): { 
    totalChats: number; 
    totalMessages: number; 
    mediaMessages: number;
  };
}

/**
 * In-memory chat history service implementation
 */
export class ChatHistoryService implements IChatHistoryService {
  private chatHistories = new Map<number, ChatMessage[]>();

  constructor(private historyLimit: number = 7) {}

  /**
   * Add user message to history
   */
  addUserMessage(
    chatId: number, 
    text: string, 
    userId: number, 
    userName?: string,
    mediaType?: 'text' | 'image' | 'audio',
    mediaData?: MediaContent
  ): void {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      text,
      userId,
      userName: userName || 'User',
      timestamp: new Date(),
      role: 'user',
      mediaType: mediaType || 'text',
      mediaData,
    };

    this.addMessageToHistory(chatId, message);
  }

  /**
   * Add assistant message to history
   */
  addAssistantMessage(chatId: number, text: string): void {
    const message: ChatMessage = {
      id: `assistant_${Date.now()}`,
      text,
      userId: 0, // Bot ID
      userName: 'AI Assistant',
      timestamp: new Date(),
      role: 'assistant',
      mediaType: 'text',
    };

    this.addMessageToHistory(chatId, message);
  }

  /**
   * Get recent chat history
   */
  getRecentHistory(chatId: number): ChatMessage[] {
    const history = this.chatHistories.get(chatId) || [];
    return history.slice(-this.historyLimit);
  }

  /**
   * Clear chat history
   */
  clearHistory(chatId: number): void {
    this.chatHistories.delete(chatId);
  }

  /**
   * Get chat statistics
   */
  getChatStats(): { 
    totalChats: number; 
    totalMessages: number; 
    mediaMessages: number;
  } {
    const totalChats = this.chatHistories.size;
    let totalMessages = 0;
    let mediaMessages = 0;

    Array.from(this.chatHistories.values()).forEach(history => {
      totalMessages += history.length;
      mediaMessages += history.filter(msg => 
        msg.mediaType === 'image' || msg.mediaType === 'audio'
      ).length;
    });

    return { totalChats, totalMessages, mediaMessages };
  }

  /**
   * Add message to history with size limit
   */
  private addMessageToHistory(chatId: number, message: ChatMessage): void {
    if (!this.chatHistories.has(chatId)) {
      this.chatHistories.set(chatId, []);
    }

    const history = this.chatHistories.get(chatId)!;
    history.push(message);

    // Limit history size
    if (history.length > this.historyLimit * 2) {
      history.splice(0, history.length - this.historyLimit);
    }
  }
} 