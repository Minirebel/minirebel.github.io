import dotenv from 'dotenv';
import { WebsiteStatusBot } from './discord-bot.js';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
const checkInterval = process.env.CHECK_INTERVAL || '*/5 * * * *'; // Every 5 minutes

if (!token) {
  console.error('DISCORD_TOKEN environment variable is required');
  process.exit(1);
}

console.log('Starting Website Status Discord Bot...');

const bot = new WebsiteStatusBot({
  token,
  channelId,
  checkInterval
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down bot...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down bot...');
  await bot.stop();
  process.exit(0);
});

// Start the bot
bot.start().catch(console.error);
