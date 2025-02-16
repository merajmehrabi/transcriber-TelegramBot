import dotenv from 'dotenv';
import { defaultLanguage } from './languages.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

// Parse whitelist from environment variable
const parseWhitelist = () => {
  const whitelistStr = process.env.TELEGRAM_USER_WHITELIST || '';
  return whitelistStr.split(',')
    .map(id => id.trim())
    .filter(id => id)
    .map(Number);
};

// Configuration object
const config = {
  // Telegram Bot settings
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    options: {
      polling: true
    },
    whitelist: {
      enabled: process.env.WHITELIST_ENABLED === 'true',
      users: parseWhitelist(),
      adminId: Number(process.env.ADMIN_USER_ID) // Admin can manage whitelist
    }
  },

  // Google Cloud settings
  google: {
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    speech: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: defaultLanguage
    }
  },

  // Bot settings
  bot: {
    maxAudioSize: parseInt(process.env.MAX_AUDIO_SIZE, 10) || 20971520, // 20MB default
    defaultLanguage: process.env.DEFAULT_LANGUAGE || defaultLanguage,
    supportedAudioFormats: ['audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp3'],
    tempDir: join(rootDir, 'temp')
  },

  // Proofreading settings
  proofreading: {
    apiKey: process.env.PROOFREADING_API_KEY,
    enabled: !!process.env.PROOFREADING_API_KEY
  },

  // Paths
  paths: {
    root: rootDir,
    locales: join(rootDir, 'locales')
  }
};

// Validation
if (!config.telegram.token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

if (!config.google.credentials) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required');
}

if (config.telegram.whitelist.enabled && !config.telegram.whitelist.adminId) {
  throw new Error('ADMIN_USER_ID is required when whitelist is enabled');
}

export default config;
