import fs from 'fs/promises';
import { join } from 'path';
import config from '../config/config.js';
import { getLanguageConfig, defaultLanguage } from '../config/languages.js';

// Cache for loaded language messages
const messageCache = new Map();

/**
 * Load messages for a specific language
 * @param {string} langCode - Language code (en, fa, sv)
 * @returns {Promise<Object>} - Messages object
 */
async function loadMessages(langCode) {
  try {
    if (messageCache.has(langCode)) {
      return messageCache.get(langCode);
    }

    const filePath = join(config.paths.locales, langCode, 'messages.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const messages = JSON.parse(fileContent);
    
    messageCache.set(langCode, messages);
    return messages;
  } catch (error) {
    console.error(`Error loading messages for ${langCode}:`, error);
    // Fallback to default language
    if (langCode !== defaultLanguage) {
      return loadMessages(defaultLanguage);
    }
    throw error;
  }
}

/**
 * Get a message in the specified language
 * @param {string} key - Message key
 * @param {string} langCode - Language code
 * @param {Object} params - Parameters to replace in the message
 * @returns {Promise<string>} - Localized message
 */
export async function getMessage(key, langCode = defaultLanguage, params = {}) {
  const messages = await loadMessages(langCode);
  let message = messages[key] || messages[`${key}_${langCode}`] || key;

  // Replace parameters in the message
  Object.entries(params).forEach(([param, value]) => {
    message = message.replace(new RegExp(`{${param}}`, 'g'), value);
  });

  return message;
}

/**
 * Clear the message cache
 */
export function clearMessageCache() {
  messageCache.clear();
}

/**
 * Get text direction for a language
 * @param {string} langCode - Language code
 * @returns {string} - 'rtl' or 'ltr'
 */
export function getTextDirection(langCode) {
  const config = getLanguageConfig(langCode);
  return config.direction;
}

/**
 * Format text based on language direction
 * @param {string} text - Text to format
 * @param {string} langCode - Language code
 * @returns {string} - Formatted text with appropriate markers
 */
export function formatText(text, langCode) {
  const direction = getTextDirection(langCode);
  if (direction === 'rtl') {
    return `\u202B${text}\u202C`; // Add RTL markers
  }
  return text;
}

export default {
  getMessage,
  clearMessageCache,
  getTextDirection,
  formatText
};
