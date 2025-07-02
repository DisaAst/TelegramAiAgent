import axios from 'axios';
import { MediaContent } from '../types';

/**
 * Interface for media processing
 */
export interface IMediaProcessor {
  processAudio(fileId: string, mimeType?: string): Promise<MediaContent>;
  processImage(fileId: string, mimeType?: string): Promise<MediaContent>;
  getFileInfo(fileId: string): Promise<any>;
  formatFileSize(bytes: number): string;
}

/**
 * Telegram media processor implementation
 */
export class TelegramMediaProcessor implements IMediaProcessor {
  private static readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for Gemini
  
  constructor(private telegramBotToken: string) {}

  /**
   * Process audio file
   */
  async processAudio(fileId: string, mimeType?: string): Promise<MediaContent> {
    const data = await this.downloadTelegramFile(fileId);
    
    if (data.byteLength > TelegramMediaProcessor.MAX_FILE_SIZE) {
      throw new Error('Audio file is too large (max 20MB)');
    }

    // Determine MIME type for audio
    let audioMimeType = mimeType || 'audio/mpeg';
    
    // Gemini supports various audio formats
    const supportedAudioTypes = [
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/aiff', 
      'audio/aac', 'audio/ogg', 'audio/flac'
    ];

    if (!supportedAudioTypes.includes(audioMimeType)) {
      audioMimeType = 'audio/mpeg'; // fallback
    }

    return {
      data,
      mimeType: audioMimeType,
      fileSize: data.byteLength,
    };
  }

  /**
   * Process image file
   */
  async processImage(fileId: string, mimeType?: string): Promise<MediaContent> {
    const data = await this.downloadTelegramFile(fileId);
    
    if (data.byteLength > TelegramMediaProcessor.MAX_FILE_SIZE) {
      throw new Error('Image file is too large (max 20MB)');
    }

    // Determine MIME type for image
    let imageMimeType = mimeType || 'image/jpeg';
    
    // Gemini supports various image formats
    const supportedImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/heic', 'image/heif'
    ];

    if (!supportedImageTypes.includes(imageMimeType)) {
      imageMimeType = 'image/jpeg'; // fallback
    }

    return {
      data,
      mimeType: imageMimeType,
      fileSize: data.byteLength,
    };
  }

  /**
   * Get file information from Telegram
   */
  async getFileInfo(fileId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.telegramBotToken}/getFile?file_id=${fileId}`
      );

      if (!response.data.ok) {
        throw new Error('Failed to get file info');
      }

      return response.data.result;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information');
    }
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Download file from Telegram and return ArrayBuffer
   */
  private async downloadTelegramFile(fileId: string): Promise<ArrayBuffer> {
    try {
      // Get file information
      const fileInfoResponse = await axios.get(
        `https://api.telegram.org/bot${this.telegramBotToken}/getFile?file_id=${fileId}`
      );

      if (!fileInfoResponse.data.ok) {
        throw new Error('Failed to get file info from Telegram');
      }

      const filePath = fileInfoResponse.data.result.file_path;
      
      // Download file
      const fileResponse = await axios.get(
        `https://api.telegram.org/file/bot${this.telegramBotToken}/${filePath}`,
        { responseType: 'arraybuffer' }
      );

      return fileResponse.data as ArrayBuffer;
    } catch (error) {
      console.error('Error downloading Telegram file:', error);
      throw new Error('Failed to download file from Telegram');
    }
  }
} 