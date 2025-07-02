import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * Convert audio from one format to another (e.g., OGG to MP3)
 * @param inputBuffer - Buffer with source audio data
 * @param inputFormat - Source audio format (e.g., 'ogg')
 * @param outputFormat - Target audio format (e.g., 'mp3')
 * @param inputCodec - Optional input audio codec
 * @returns Promise that resolves to buffer with converted audio
 */
export function convertAudio(
  inputBuffer: Buffer,
  inputFormat: string,
  outputFormat: string = 'mp3',
  inputCodec?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const outputBuffers: any[] = [];
    
    const readableStream = new Readable();
    readableStream.push(inputBuffer);
    readableStream.push(null);

    let command = ffmpeg(readableStream);

    // Specify codec if provided (important for ogg/opus)
    if (inputCodec) {
      command = command.inputOption(`-c:a ${inputCodec}`);
    }
    
    command
      .inputFormat(inputFormat)
      .toFormat(outputFormat)
      .on('error', (err: Error) => {
        console.error(`An error occurred during conversion: ${err.message}. Input format: ${inputFormat}, codec: ${inputCodec}`);
        reject(err);
      })
      .on('end', () => {
        const outputBuffer = Buffer.concat(outputBuffers);
        if (outputBuffer.length === 0) {
          console.error('Conversion resulted in an empty buffer. Something is wrong.');
          reject(new Error('Conversion resulted in an empty buffer.'));
          return;
        }
        resolve(outputBuffer);
      });

    const outputStream = command.pipe();

    outputStream.on('data', (chunk: Buffer) => {
      outputBuffers.push(chunk);
    });
  });
} 