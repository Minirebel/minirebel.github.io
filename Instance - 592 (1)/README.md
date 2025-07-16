# Website Status Monitor Discord Bot

A Discord bot that monitors website status and sends alerts when websites go offline.

## Features

- **Real-time monitoring**: Periodic checks of website status
- **Discord notifications**: Get notified when websites go offline
- **Slash commands**: Easy-to-use commands for managing monitored websites
- **Response time tracking**: Monitor website performance
- **Database persistence**: Store website data and check history

## Setup

### Prerequisites

1. Node.js 18+ installed
2. A Discord application and bot token
3. SQLite database (automatically created)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_channel_id_for_alerts (optional)
   CHECK_INTERVAL=*/5 * * * * (optional, defaults to every 5 minutes)
   DATA_DIRECTORY=./data (optional, defaults to ./data)
   ```

### Getting Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to the "Bot" section
4. Create a bot and copy the token
5. Under "Privileged Gateway Intents", enable "Message Content Intent"
6. Go to OAuth2 > URL Generator
7. Select "bot" and "applications.commands" scopes
8. Select necessary permissions (Send Messages, Use Slash Commands)
9. Use the generated URL to invite the bot to your server

### Running the Bot

#### Development Mode
```bash
npm run bot:dev
```

#### Production Mode
```bash
npm run bot:start
```

## Commands

- `/status` - Check the status of all monitored websites
- `/add <name> <url>` - Add a website to monitor
- `/remove <id>` - Remove a website from monitoring
- `/list` - List all monitored websites
- `/check` - Force check all websites now

## Configuration

### Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token (required)
- `DISCORD_CHANNEL_ID`: Channel ID for automatic alerts (optional)
- `CHECK_INTERVAL`: Cron expression for check frequency (default: every 5 minutes)
- `DATA_DIRECTORY`: Directory for database storage (default: ./data)

### Check Interval Examples

- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

## Database

The bot uses SQLite database with two tables:
- `websites`: Stores website information
- `status_checks`: Stores check history and results

## Features in Detail

### Automatic Monitoring
- Periodic checks based on configured interval
- Automatic alerts sent to specified Discord channel
- Only alerts when websites go offline (reduces spam)

### Status Tracking
- Response time measurement
- Online/offline status tracking
- Historical data storage

### Discord Integration
- Slash commands for easy interaction
- Rich embeds with status information
- Real-time notifications

## Troubleshooting

### Common Issues

1. **Bot not responding to commands**
   - Ensure the bot has necessary permissions
   - Check if slash commands are registered
   - Verify the bot token is correct

2. **Database errors**
   - Ensure DATA_DIRECTORY exists and is writable
   - Check file permissions

3. **Network timeouts**
   - Websites are checked with a 10-second timeout
   - Some websites may block bot requests

### Logs

The bot logs important events to the console:
- Bot startup and ready status
- Command registrations
- Error messages
- Periodic check results

## License

MIT License
