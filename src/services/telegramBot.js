import { Bot } from 'grammy';
import config from '../config/config.js';
import languageUtils from '../utils/languageUtils.js';
import audioProcessor from '../utils/audioProcessor.js';
import speechToTextService from './speechToText.js';
import proofreaderService from './proofreader.js';
import { isValidLanguage } from '../config/languages.js';
import logger from '../utils/logger.js';
import axios from 'axios';

class TelegramBotService {
  constructor() {
    this.bot = new Bot(config.telegram.token);
    this.userLanguages = new Map(); // Store user language preferences
    this.whitelist = new Set(config.telegram.whitelist.users); // Initialize whitelist
    this.setupHandlers();
  }

  /**
   * Check if message is from a group chat
   * @param {object} ctx - Grammy context
   * @returns {boolean} - True if message is from a group
   */
  isGroupChat(ctx) {
    return ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
  }

  /**
   * Check if command is allowed in groups
   * @param {string} command - Command name without slash
   * @returns {boolean} - True if command is allowed
   */
  isCommandAllowedInGroup(command) {
    return config.telegram.groups.allowedCommands.includes(command);
  }

  /**
   * Check if user is whitelisted
   * @param {number} userId - Telegram user ID
   * @returns {boolean} - True if user is whitelisted or whitelist is disabled
   */
  isUserWhitelisted(userId) {
    if (!config.telegram.whitelist.enabled) return true;
    return userId === config.telegram.whitelist.adminId || this.whitelist.has(userId);
  }

  /**
   * Check if user is admin
   * @param {number} userId - Telegram user ID
   * @returns {boolean} - True if user is admin
   */
  isAdmin(userId) {
    return userId === config.telegram.whitelist.adminId;
  }

  /**
   * Set up all bot command and message handlers
   */
  setupHandlers() {
    // Middleware to check whitelist, group settings, and log interactions
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      const command = ctx.message?.text || 'non-text interaction';
      const isGroup = this.isGroupChat(ctx);
      
      // Check whitelist first
      if (!userId || !this.isUserWhitelisted(userId)) {
        logger.warn('Unauthorized access attempt', { userId, command, isGroup });
        await ctx.reply('Sorry, you are not authorized to use this bot.');
        return;
      }

      // Handle group chat restrictions
      if (isGroup && config.telegram.groups.commandsOnly) {
        const isCommand = ctx.message?.text?.startsWith('/');
        if (!isCommand && config.telegram.groups.ignoreNonCommands) {
          logger.debug('Ignoring non-command message in group', { userId, command });
          return; // Silently ignore non-command messages in groups
        }

        if (isCommand) {
          const commandName = ctx.message.text.split(' ')[0].substring(1);
          if (!this.isCommandAllowedInGroup(commandName)) {
            logger.warn('Unauthorized command in group', { userId, command });
            return; // Silently ignore unauthorized commands in groups
          }
        }
      }

      logger.debug('Processing request', { userId, command, isGroup });
      await next();
    });

    // Basic command handlers
    this.bot.command('start', this.handleStart.bind(this));
    this.bot.command('help', this.handleHelp.bind(this));
    this.bot.command('settings', this.handleSettings.bind(this));
    this.bot.command('language', this.handleLanguage.bind(this));

    // Audio handlers
    this.bot.on('message:voice', this.handleAudio.bind(this));
    this.bot.on('message:audio', this.handleAudio.bind(this));
    
    // Proofreading handler
    this.bot.command('proofread', this.handleProofread.bind(this));

    // Admin commands
    if (config.telegram.whitelist.enabled) {
      this.bot.command('adduser', this.handleAddUser.bind(this));
      this.bot.command('removeuser', this.handleRemoveUser.bind(this));
      this.bot.command('listusers', this.handleListUsers.bind(this));
      this.bot.command('debug', this.handleDebug.bind(this));
    }

    // Error handler
    this.bot.catch((err) => {
      logger.error('Bot error:', err);
    });
  }

  /**
   * Start the bot
   */
  start() {
    logger.info('Bot starting...');
    this.bot.start();
  }

  /**
   * Handle /debug command (admin only)
   * @param {object} ctx - Grammy context
   */
  async handleDebug(ctx) {
    if (!this.isAdmin(ctx.from.id)) {
      logger.warn('Non-admin debug attempt', { userId: ctx.from.id });
      await ctx.reply('This command is only available to administrators.');
      return;
    }

    const args = ctx.match.trim().split(' ');
    if (args[0] === 'on') {
      logger.setDebugMode(true);
      await ctx.reply('Debug mode enabled. Check logs for detailed information.');
    } else if (args[0] === 'off') {
      logger.setDebugMode(false);
      await ctx.reply('Debug mode disabled.');
    } else {
      await ctx.reply('Usage: /debug [on|off]');
    }
  }

  /**
   * Handle /adduser command (admin only)
   * @param {object} ctx - Grammy context
   */
  async handleAddUser(ctx) {
    if (!this.isAdmin(ctx.from.id)) {
      logger.warn('Non-admin whitelist modification attempt', { userId: ctx.from.id });
      await ctx.reply('This command is only available to administrators.');
      return;
    }

    const userId = parseInt(ctx.match, 10);
    if (isNaN(userId)) {
      await ctx.reply('Please provide a valid user ID. Usage: /adduser <user_id>');
      return;
    }

    this.whitelist.add(userId);
    logger.logWhitelistOperation(ctx.from.id, 'add', userId);
    await ctx.reply(`User ${userId} has been added to the whitelist.`);
  }

  /**
   * Handle /removeuser command (admin only)
   * @param {object} ctx - Grammy context
   */
  async handleRemoveUser(ctx) {
    if (!this.isAdmin(ctx.from.id)) {
      logger.warn('Non-admin whitelist modification attempt', { userId: ctx.from.id });
      await ctx.reply('This command is only available to administrators.');
      return;
    }

    const userId = parseInt(ctx.match, 10);
    if (isNaN(userId)) {
      await ctx.reply('Please provide a valid user ID. Usage: /removeuser <user_id>');
      return;
    }

    if (userId === config.telegram.whitelist.adminId) {
      logger.warn('Attempt to remove admin from whitelist', { userId: ctx.from.id });
      await ctx.reply('Cannot remove admin from whitelist.');
      return;
    }

    this.whitelist.delete(userId);
    logger.logWhitelistOperation(ctx.from.id, 'remove', userId);
    await ctx.reply(`User ${userId} has been removed from the whitelist.`);
  }

  /**
   * Handle /listusers command (admin only)
   * @param {object} ctx - Grammy context
   */
  async handleListUsers(ctx) {
    if (!this.isAdmin(ctx.from.id)) {
      logger.warn('Non-admin whitelist view attempt', { userId: ctx.from.id });
      await ctx.reply('This command is only available to administrators.');
      return;
    }

    const userList = Array.from(this.whitelist).join('\n');
    const adminInfo = `Admin: ${config.telegram.whitelist.adminId}`;
    const message = `Whitelisted Users:\n${userList}\n\n${adminInfo}`;
    await ctx.reply(message || 'No users in whitelist.');
  }

  /**
   * Get user's preferred language
   * @param {number} userId - Telegram user ID
   * @returns {string} - Language code
   */
  getUserLanguage(userId) {
    return this.userLanguages.get(userId) || config.bot.defaultLanguage;
  }

  /**
   * Send localized message to user
   * @param {object} ctx - Grammy context
   * @param {string} messageKey - Message key in locale files
   * @param {Object} params - Parameters for message
   */
  async sendLocalizedMessage(ctx, messageKey, params = {}) {
    const userId = ctx.from?.id;
    const langCode = this.getUserLanguage(userId);
    const message = await languageUtils.getMessage(messageKey, langCode, params);
    await ctx.reply(languageUtils.formatText(message, langCode));
  }

  /**
   * Handle /start command
   * @param {object} ctx - Grammy context
   */
  async handleStart(ctx) {
    logger.logInteraction(ctx.from.id, 'start');
    await this.sendLocalizedMessage(ctx, 'welcome');
    await this.sendLocalizedMessage(ctx, 'help');
  }

  /**
   * Handle /help command
   * @param {object} ctx - Grammy context
   */
  async handleHelp(ctx) {
    logger.logInteraction(ctx.from.id, 'help');
    let helpMessage = await languageUtils.getMessage('help', this.getUserLanguage(ctx.from.id));
    
    // Add admin commands if user is admin and whitelist is enabled
    if (config.telegram.whitelist.enabled && this.isAdmin(ctx.from.id)) {
      const adminCommands = `\n\nAdmin Commands:
/adduser <user_id> - Add user to whitelist
/removeuser <user_id> - Remove user from whitelist
/listusers - List all whitelisted users
/debug [on|off] - Enable/disable debug mode`;
      helpMessage += adminCommands;
    }
    
    await ctx.reply(helpMessage);
  }

  /**
   * Handle /language command
   * @param {object} ctx - Grammy context
   */
  async handleLanguage(ctx) {
    const langCode = ctx.match;
    if (isValidLanguage(langCode)) {
      this.userLanguages.set(ctx.from.id, langCode);
      logger.logInteraction(ctx.from.id, 'language', true, { langCode });
      await this.sendLocalizedMessage(ctx, 'language_set');
    } else {
      logger.logInteraction(ctx.from.id, 'language', false, { langCode });
      await this.sendLocalizedMessage(ctx, 'invalid_language');
    }
  }

  /**
   * Handle /settings command
   * @param {object} ctx - Grammy context
   */
  async handleSettings(ctx) {
    logger.logInteraction(ctx.from.id, 'settings');
    await this.sendLocalizedMessage(ctx, 'settings_current');
  }

  /**
   * Handle audio messages and files
   * @param {object} ctx - Grammy context
   */
  async handleAudio(ctx) {
    // Don't process audio in groups unless it's a direct command
    if (this.isGroupChat(ctx) && config.telegram.groups.commandsOnly) {
      logger.debug('Ignoring audio in group chat', { userId: ctx.from.id });
      return;
    }

    try {
      const audio = ctx.message.voice || ctx.message.audio;
      if (!audio) {
        logger.logInteraction(ctx.from.id, 'audio', false, { error: 'no_audio' });
        await this.sendLocalizedMessage(ctx, 'error_no_audio');
        return;
      }

      // Check file size
      if (!audioProcessor.isFileSizeValid(audio.file_size)) {
        logger.logInteraction(ctx.from.id, 'audio', false, { error: 'file_too_large', size: audio.file_size });
        await this.sendLocalizedMessage(ctx, 'error_too_large');
        return;
      }

      logger.debug('Processing audio', { userId: ctx.from.id, fileId: audio.file_id, fileSize: audio.file_size });
      await this.sendLocalizedMessage(ctx, 'processing_audio');

      // Get file info
      const file = await ctx.api.getFile(audio.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${config.telegram.token}/${file.file_path}`;

      // Process audio file
      const { path: audioPath, cleanup } = await audioProcessor.processAudioFile(fileUrl, audio.file_id);

      try {
        // Transcribe audio
        const langCode = this.getUserLanguage(ctx.from.id);
        const transcription = await speechToTextService.transcribe(audioPath, langCode);
        
        // Send transcription
        await ctx.reply(transcription);
        await this.sendLocalizedMessage(ctx, 'success');
        logger.logInteraction(ctx.from.id, 'audio', true, { fileId: audio.file_id });
      } finally {
        // Clean up temporary files
        await cleanup();
      }
    } catch (error) {
      logger.error('Error processing audio:', error);
      logger.logInteraction(ctx.from.id, 'audio', false, { error: error.message });
      await this.sendLocalizedMessage(ctx, 'error_processing');
    }
  }

  /**
   * Handle /proofread command
   * @param {object} ctx - Grammy context
   */
  async handleProofread(ctx) {
    // Don't process proofreading in groups unless explicitly allowed
    if (this.isGroupChat(ctx) && !this.isCommandAllowedInGroup('proofread')) {
      logger.debug('Ignoring proofread in group chat', { userId: ctx.from.id });
      return;
    }

    try {
      const replyToMessage = ctx.message.reply_to_message;
      if (!replyToMessage?.text) {
        logger.logInteraction(ctx.from.id, 'proofread', false, { error: 'no_text' });
        await this.sendLocalizedMessage(ctx, 'no_text_to_proofread');
        return;
      }

      logger.debug('Proofreading text', { userId: ctx.from.id, textLength: replyToMessage.text.length });
      await this.sendLocalizedMessage(ctx, 'proofreading');

      const langCode = this.getUserLanguage(ctx.from.id);
      const improvedText = await proofreaderService.proofread(
        replyToMessage.text,
        langCode
      );

      await ctx.reply(improvedText);
      logger.logInteraction(ctx.from.id, 'proofread', true);
    } catch (error) {
      logger.error('Error proofreading text:', error);
      logger.logInteraction(ctx.from.id, 'proofread', false, { error: error.message });
      await this.sendLocalizedMessage(ctx, 'error_processing');
    }
  }
}

// Create singleton instance
const telegramBotService = new TelegramBotService();

export default telegramBotService;
