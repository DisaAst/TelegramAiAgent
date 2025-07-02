import { ITextAgent, IAudioAgent, IImageAgent, IMultimediaAgent, MultimediaRequest } from '../agents/interfaces';
import { IUserSettingsService } from './UserSettingsService';
import { IChatHistoryService } from './ChatHistoryService';
import { AIResponse, ChatMessage, MediaContent } from '../types';

/**
 * Interface for main AI service
 */
export interface IAIService {
  generateResponse(
    prompt: string, 
    history: ChatMessage[], 
    userId?: number
  ): Promise<AIResponse>;
  
  generateMultimediaResponse(request: MultimediaRequest): Promise<AIResponse>;
  transcribeAudio(audioData: MediaContent, userTimezone?: string): Promise<string>;
  analyzeImage(imageData: MediaContent, text?: string, userTimezone?: string): Promise<AIResponse>;
}

/**
 * Main AI service that orchestrates all AI agents
 */
export class AIService implements IAIService {
  constructor(
    private textAgent: ITextAgent,
    private audioAgent: IAudioAgent,
    private imageAgent: IImageAgent,
    private multimediaAgent: IMultimediaAgent,
    private userSettingsService: IUserSettingsService,
    private chatHistoryService: IChatHistoryService
  ) {}

  /**
   * Generate response for text messages
   */
  async generateResponse(
    prompt: string, 
    history: ChatMessage[] = [],
    userId?: number
  ): Promise<AIResponse> {
    const context = this.formatChatHistory(history);
    return await this.textAgent.processText(prompt, context, userId);
  }

  /**
   * Format chat history for context
   */
  private formatChatHistory(history: ChatMessage[]): string {
    if (history.length === 0) return '';
    
    const formattedHistory = history
      .map(msg => {
        let messageText = `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
        if (msg.mediaType === 'image') {
          messageText += ' [User sent an image]';
        } else if (msg.mediaType === 'audio') {
          messageText += ' [User sent audio message]';
        }
        return messageText;
      })
      .join('\n');

    return `Previous conversation context:\n${formattedHistory}\n\n`;
  }

  /**
   * Generate multimedia response
   */
  async generateMultimediaResponse(request: MultimediaRequest): Promise<AIResponse> {
    return await this.multimediaAgent.processMultimedia(request);
  }

  /**
   * Transcribe audio message
   */
  async transcribeAudio(audioData: MediaContent, userTimezone?: string): Promise<string> {
    return await this.audioAgent.processAudio(audioData);
  }

  /**
   * Analyze image
   */
  async analyzeImage(
    imageData: MediaContent, 
    text?: string, 
    userTimezone?: string
  ): Promise<AIResponse> {
    return await this.imageAgent.analyzeImage(imageData, text, userTimezone);
  }
} 