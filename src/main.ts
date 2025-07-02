import { configureDI } from './container/config';
import { container } from './container/container';
import { TOKENS } from './container/types';
import { ITelegramBot } from './modules/telegram/TelegramBot';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    console.log('🤖 Starting Telegram AI Agent...');
    
    // Configure dependency injection
    configureDI();
    console.log('✅ Dependency injection configured');
    
    // Get and start the bot
    const telegramBot = container.get<ITelegramBot>(TOKENS.TelegramBot);
    telegramBot.start();
    
    console.log('🎉 Telegram AI Agent is ready!');
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}); 