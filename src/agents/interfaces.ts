import { AIResponse, MediaContent } from '../types';

/**
 * Base interface for all AI agents
 */
export interface IAgent {
  readonly name: string;
  readonly version: string;
}

/**
 * Interface for text processing agents
 */
export interface ITextAgent extends IAgent {
  /**
   * Process text input and generate response
   * @param prompt - Text prompt
   * @param context - Additional context
   * @param userId - User ID for personalization
   * @returns AI response
   */
  processText(
    prompt: string, 
    context?: string, 
    userId?: number
  ): Promise<AIResponse>;
}

/**
 * Interface for audio processing agents
 */
export interface IAudioAgent extends IAgent {
  /**
   * Process audio content
   * @param audioData - Audio data
   * @param prompt - Optional text prompt
   * @returns Processed response
   */
  processAudio(audioData: MediaContent, prompt?: string): Promise<string>;

  /**
   * Transcribe audio only without additional processing
   * @param audioData - Audio data
   * @returns Transcription text
   */
  transcribeOnly(audioData: MediaContent): Promise<string>;
}

/**
 * Interface for image processing agents
 */
export interface IImageAgent extends IAgent {
  /**
   * Analyze image content
   * @param imageData - Image data
   * @param prompt - Optional text prompt/question
   * @param userTimezone - User timezone for context
   * @returns AI response with analysis
   */
  analyzeImage(
    imageData: MediaContent, 
    prompt?: string, 
    userTimezone?: string
  ): Promise<AIResponse>;
}

/**
 * Interface for multimedia processing agents
 */
export interface IMultimediaAgent extends IAgent {
  /**
   * Process multimedia request (images + audio + text)
   * @param request - Multimedia request
   * @returns AI response
   */
  processMultimedia(request: MultimediaRequest): Promise<AIResponse>;
}

/**
 * Multimedia request interface
 */
export interface MultimediaRequest {
  text?: string;
  images?: MediaContent[];
  audio?: MediaContent;
  userId?: number;
  userTimezone?: string;
} 