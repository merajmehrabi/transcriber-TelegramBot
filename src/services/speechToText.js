import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs/promises';
import config from '../config/config.js';
import { getGoogleLanguageCode } from '../config/languages.js';

class SpeechToTextService {
  constructor() {
    this.client = new SpeechClient();
  }

  /**
   * Convert audio file to text
   * @param {string} audioPath - Path to audio file
   * @param {string} languageCode - Language code for transcription
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribe(audioPath, languageCode) {
    try {
      // Read the audio file
      const audioContent = await fs.readFile(audioPath);

      // Prepare the request
      const audio = {
        content: audioContent.toString('base64'),
      };

      const googleLanguageCode = getGoogleLanguageCode(languageCode);

      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: googleLanguageCode,
        model: 'default',
        audioChannelCount: 1,
        enableAutomaticPunctuation: true,
        useEnhanced: true, // Use enhanced model
      };

      const request = {
        audio: audio,
        config: config,
      };

      // Perform the transcription
      const [response] = await this.client.recognize(request);

      // Combine all transcriptions
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      return transcription;
    } catch (error) {
      console.error('Error in speech to text conversion:', error);
      throw new Error('Failed to transcribe audio: ' + error.message);
    }
  }

  /**
   * Get supported languages from Google Speech-to-Text
   * @returns {Promise<Array>} - List of supported languages
   */
  async getSupportedLanguages() {
    try {
      const [languages] = await this.client.getSupportedLanguages();
      return languages;
    } catch (error) {
      console.error('Error getting supported languages:', error);
      throw new Error('Failed to get supported languages: ' + error.message);
    }
  }

  /**
   * Check if a language is supported
   * @param {string} languageCode - Language code to check
   * @returns {Promise<boolean>} - True if language is supported
   */
  async isLanguageSupported(languageCode) {
    try {
      const languages = await this.getSupportedLanguages();
      return languages.some(lang => lang.languageCode === languageCode);
    } catch (error) {
      console.error('Error checking language support:', error);
      return false;
    }
  }
}

// Create singleton instance
const speechToTextService = new SpeechToTextService();

export default speechToTextService;
