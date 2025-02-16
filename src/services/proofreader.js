import config from '../config/config.js';
import { getLanguageConfig } from '../config/languages.js';

class ProofreaderService {
  constructor() {
    this.enabled = config.proofreading.enabled;
    this.apiKey = config.proofreading.apiKey;
  }

  /**
   * Basic text cleanup and formatting
   * @param {string} text - Text to clean
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    return text
      .trim()
      .replace(/\s+/g, ' ')           // Remove extra spaces
      .replace(/([.!?])\s*(?=[A-Z])/g, '$1 '); // Ensure space after punctuation
  }

  /**
   * Fix common punctuation issues
   * @param {string} text - Text to fix
   * @param {string} langCode - Language code
   * @returns {string} - Fixed text
   */
  fixPunctuation(text, langCode) {
    const lang = getLanguageConfig(langCode);
    
    if (lang.direction === 'ltr') {
      return text
        .replace(/\s+([.,!?;:])/g, '$1')  // Remove spaces before punctuation
        .replace(/([.,!?;:])\s*/g, '$1 '); // Add space after punctuation
    } else {
      // RTL languages might have different punctuation rules
      return text
        .replace(/\s+([،؛؟.])/g, '$1')    // Remove spaces before RTL punctuation
        .replace(/([،؛؟.])\s*/g, '$1 ');   // Add space after RTL punctuation
    }
  }

  /**
   * Fix common number formatting issues
   * @param {string} text - Text to fix
   * @param {string} langCode - Language code
   * @returns {string} - Fixed text
   */
  fixNumbers(text, langCode) {
    if (langCode === 'fa') {
      // Convert English numbers to Persian
      return text.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    }
    return text;
  }

  /**
   * Proofread and improve text
   * @param {string} text - Text to proofread
   * @param {string} langCode - Language code
   * @returns {Promise<string>} - Improved text
   */
  async proofread(text, langCode) {
    try {
      // Basic cleanup
      let improvedText = this.cleanText(text);
      
      // Fix punctuation
      improvedText = this.fixPunctuation(improvedText, langCode);
      
      // Fix numbers
      improvedText = this.fixNumbers(improvedText, langCode);

      // If external proofreading service is enabled, use it
      if (this.enabled && this.apiKey) {
        try {
          // Here you would integrate with your preferred proofreading API
          // For example: Grammarly, LanguageTool, etc.
          // This is a placeholder for the API integration
          // improvedText = await this.callProofreadingAPI(improvedText, langCode);
          console.log('External proofreading service would be called here');
        } catch (apiError) {
          console.error('External proofreading service error:', apiError);
          // Continue with basic improvements if API fails
        }
      }

      return improvedText;
    } catch (error) {
      console.error('Error in proofreading:', error);
      // Return original text if proofreading fails
      return text;
    }
  }

  /**
   * Check if proofreading is supported for a language
   * @param {string} langCode - Language code to check
   * @returns {boolean} - True if proofreading is supported
   */
  isSupported(langCode) {
    // Add logic to check if the language is supported by your proofreading service
    return ['en', 'fa', 'sv'].includes(langCode);
  }
}

// Create singleton instance
const proofreaderService = new ProofreaderService();

export default proofreaderService;
