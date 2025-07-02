import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAudioAgent } from '../interfaces';
import { MediaContent } from '../../types';
import { AI_PROMPTS } from '../../constants/prompts';
import { MODEL_CONFIG } from '../../constants/aiModels';
import { convertAudio } from '../../utils/mediaConverter';

/**
 * Gemini-based audio processing agent
 */
export class GeminiAudioAgent implements IAudioAgent {
  public readonly name = 'GeminiAudioAgent';
  public readonly version = '1.0.0';

  private genAI: GoogleGenerativeAI;

  constructor(private apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Process audio message with transcription and response
   */
  async processAudio(audioData: MediaContent, prompt?: string): Promise<string> {
    try {
      console.log(`🎤 Processing audio with Gemini: ${audioData.mimeType}, ${audioData.fileSize} bytes`);

      const audioBuffer = await this.prepareAudioForGemini(audioData);
      const base64Audio = audioBuffer.toString('base64');

      const contents = [
        { 
          text: prompt || AI_PROMPTS.AUDIO.TRANSCRIBE_AND_RESPOND
        },
        {
          inlineData: {
            mimeType: 'audio/mp3',
            data: base64Audio,
          },
        },
      ];

      const model = this.genAI.getGenerativeModel({ model: MODEL_CONFIG.AUDIO_AGENT });
      const response = await model.generateContent(contents);
      
      const result = response.response.text();
      console.log(`✅ Audio processed successfully`);
      
      return result;
    } catch (error) {
      console.error('Error processing audio with GeminiAudioAgent:', error);
      throw new Error('Failed to process audio message');
    }
  }

  /**
   * Transcribe audio without additional processing
   */
  async transcribeOnly(audioData: MediaContent): Promise<string> {
    return this.processAudio(audioData, AI_PROMPTS.AUDIO.TRANSCRIBE_ONLY);
  }

  /**
   * Prepare audio data for Gemini API (convert to MP3 if needed)
   */
  private async prepareAudioForGemini(audioData: MediaContent): Promise<Buffer> {
    let audioBuffer: Buffer;

    // Convert to MP3 for better compatibility if needed
    if (audioData.mimeType !== 'audio/mp3') {
      console.log(`🔄 Converting ${audioData.mimeType} to MP3...`);
      const inputFormat = audioData.mimeType.split('/')[1];
      const inputCodec = inputFormat === 'ogg' ? 'libopus' : undefined;
      
      audioBuffer = await convertAudio(
        Buffer.from(audioData.data),
        inputFormat,
        'mp3',
        inputCodec
      );
      console.log(`✅ Audio converted to MP3: ${audioBuffer.length} bytes`);
    } else {
      audioBuffer = Buffer.from(audioData.data);
    }

    return audioBuffer;
  }
} 