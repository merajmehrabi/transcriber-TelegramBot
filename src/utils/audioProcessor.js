import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import axios from 'axios';
import config from '../config/config.js';

/**
 * Download audio file from Telegram
 * @param {string} fileUrl - Telegram file URL
 * @param {string} outputPath - Path to save the file
 * @returns {Promise<string>} - Path to downloaded file
 */
export async function downloadAudio(fileUrl, outputPath) {
  const response = await axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream'
  });

  const writer = createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(outputPath));
    writer.on('error', reject);
  });
}

/**
 * Convert audio to WAV format suitable for Google Speech-to-Text
 * @param {string} inputPath - Path to input audio file
 * @param {string} outputPath - Path to save converted file
 * @returns {Promise<string>} - Path to converted file
 */
export function convertToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('error', (err) => {
        console.error('Error converting audio:', err);
        reject(err);
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .save(outputPath);
  });
}

/**
 * Process audio file for transcription
 * @param {string} fileUrl - Telegram file URL
 * @param {string} fileId - Telegram file ID
 * @returns {Promise<{path: string, cleanup: Function}>} - Path to processed file and cleanup function
 */
export async function processAudioFile(fileUrl, fileId) {
  // Create temp directory if it doesn't exist
  await fs.mkdir(config.bot.tempDir, { recursive: true });

  const originalPath = join(config.bot.tempDir, `${fileId}_original`);
  const wavPath = join(config.bot.tempDir, `${fileId}.wav`);

  try {
    // Download the file
    await downloadAudio(fileUrl, originalPath);

    // Convert to WAV format
    await convertToWav(originalPath, wavPath);

    // Create cleanup function
    const cleanup = async () => {
      try {
        await fs.unlink(originalPath);
        await fs.unlink(wavPath);
      } catch (error) {
        console.error('Error cleaning up temp files:', error);
      }
    };

    return {
      path: wavPath,
      cleanup
    };
  } catch (error) {
    // Clean up in case of error
    try {
      await fs.unlink(originalPath);
      await fs.unlink(wavPath);
    } catch (cleanupError) {
      console.error('Error cleaning up after failure:', cleanupError);
    }
    throw error;
  }
}

/**
 * Check if audio file size is within limits
 * @param {number} fileSize - File size in bytes
 * @returns {boolean} - True if file is within size limits
 */
export function isFileSizeValid(fileSize) {
  return fileSize <= config.bot.maxAudioSize;
}

/**
 * Check if audio format is supported
 * @param {string} mimeType - Audio file MIME type
 * @returns {boolean} - True if format is supported
 */
export function isFormatSupported(mimeType) {
  return config.bot.supportedAudioFormats.includes(mimeType);
}

export default {
  processAudioFile,
  isFileSizeValid,
  isFormatSupported
};
