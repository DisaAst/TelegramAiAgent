import { IMultimediaAgent, IAudioAgent, IImageAgent, MultimediaRequest } from '../interfaces';
import { AIResponse } from '../../types';

/**
 * Multimedia agent that orchestrates audio and image processing
 */
export class MultimediaAgent implements IMultimediaAgent {
  public readonly name = 'MultimediaAgent';
  public readonly version = '1.0.0';

  constructor(
    private audioAgent: IAudioAgent,
    private imageAgent: IImageAgent
  ) {}

  /**
   * Process multimedia request (images + audio + text)
   */
  async processMultimedia(request: MultimediaRequest): Promise<AIResponse> {
    const { text, images, audio, userTimezone } = request;

    // Process audio only
    if (audio && (!images || images.length === 0)) {
      const audioResult = await this.audioAgent.processAudio(
        audio, 
        text || undefined
      );
      
      return {
        text: audioResult,
        timestamp: new Date(),
        usedWebSearch: false,
        steps: 1,
        mediaProcessed: true,
      };
    }

    // Process images (with optional text)
    if (images && images.length > 0) {
      return await this.imageAgent.analyzeImage(
        images[0],
        text || undefined,
        userTimezone
      );
    }

    // Fallback for other cases
    throw new Error('Unsupported multimedia request format');
  }
} 