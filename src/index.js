import telegramBotService from './services/telegramBot.js';
import config from './config/config.js';

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Attempt graceful shutdown
  shutdown();
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  // Attempt graceful shutdown
  shutdown();
});

// Graceful shutdown function
async function shutdown() {
  console.log('Shutting down gracefully...');
  try {
    // Cleanup operations if needed
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the bot
async function startBot() {
  try {
    console.log('Starting Telegram Bot...');
    console.log(`Default language: ${config.bot.defaultLanguage}`);
    console.log(`Max audio size: ${config.bot.maxAudioSize} bytes`);
    console.log('Supported audio formats:', config.bot.supportedAudioFormats.join(', '));
    
    // Start the bot
    telegramBotService.start();
    
    console.log('Bot is running...');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Run the bot
startBot();
