import { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { checkAllWebsites, checkWebsiteStatus, getWebsiteStatuses } from '../server/status-checker.js';
import { db } from '../server/database.js';
import cron from 'node-cron';

interface BotConfig {
  token: string;
  channelId?: string;
  checkInterval?: string;
}

export class WebsiteStatusBot {
  private client: Client;
  private config: BotConfig;
  private monitoringChannel: TextChannel | null = null;

  constructor(config: BotConfig) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
    this.setupSlashCommands();
  }

  private setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`Bot is ready! Logged in as ${this.client.user?.tag}`);
      this.setupMonitoringChannel();
      this.startPeriodicChecks();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        await this.handleSlashCommand(interaction);
      } catch (error) {
        console.error('Error handling slash command:', error);
        await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
      }
    });
  }

  private async setupSlashCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check the status of all monitored websites'),
      
      new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a website to monitor')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Website name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('url')
            .setDescription('Website URL')
            .setRequired(true)),
      
      new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a website from monitoring')
        .addIntegerOption(option =>
          option.setName('id')
            .setDescription('Website ID')
            .setRequired(true)),
      
      new SlashCommandBuilder()
        .setName('list')
        .setDescription('List all monitored websites'),
      
      new SlashCommandBuilder()
        .setName('check')
        .setDescription('Force check all websites now'),
    ];

    this.client.on('ready', async () => {
      try {
        console.log('Registering slash commands...');
        await this.client.application?.commands.set(commands);
        console.log('Slash commands registered successfully');
      } catch (error) {
        console.error('Error registering slash commands:', error);
      }
    });
  }

  private async handleSlashCommand(interaction: ChatInputCommandInteraction) {
    const { commandName } = interaction;

    switch (commandName) {
      case 'status':
        await this.handleStatusCommand(interaction);
        break;
      case 'add':
        await this.handleAddCommand(interaction);
        break;
      case 'remove':
        await this.handleRemoveCommand(interaction);
        break;
      case 'list':
        await this.handleListCommand(interaction);
        break;
      case 'check':
        await this.handleCheckCommand(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown command!', ephemeral: true });
    }
  }

  private async handleStatusCommand(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const websites = await getWebsiteStatuses();
      
      if (websites.length === 0) {
        await interaction.editReply('No websites are being monitored.');
        return;
      }

      const embed = this.createStatusEmbed(websites);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in status command:', error);
      await interaction.editReply('Error fetching website statuses.');
    }
  }

  private async handleAddCommand(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('name', true);
    const url = interaction.options.getString('url', true);

    try {
      // Validate URL
      new URL(url);
      
      await db.insertInto('websites').values({
        name,
        url
      }).execute();

      await interaction.reply(`✅ Added **${name}** (${url}) to monitoring.`);
    } catch (error) {
      console.error('Error adding website:', error);
      await interaction.reply({ content: 'Error adding website. Please check the URL format.', ephemeral: true });
    }
  }

  private async handleRemoveCommand(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getInteger('id', true);

    try {
      const website = await db.selectFrom('websites').selectAll().where('id', '=', id).executeTakeFirst();
      
      if (!website) {
        await interaction.reply({ content: 'Website not found.', ephemeral: true });
        return;
      }

      await db.deleteFrom('status_checks').where('website_id', '=', id).execute();
      await db.deleteFrom('websites').where('id', '=', id).execute();

      await interaction.reply(`✅ Removed **${website.name}** from monitoring.`);
    } catch (error) {
      console.error('Error removing website:', error);
      await interaction.reply({ content: 'Error removing website.', ephemeral: true });
    }
  }

  private async handleListCommand(interaction: ChatInputCommandInteraction) {
    try {
      const websites = await db.selectFrom('websites').selectAll().execute();
      
      if (websites.length === 0) {
        await interaction.reply('No websites are being monitored.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Monitored Websites')
        .setColor(0x0099FF)
        .setDescription(
          websites.map(w => `**${w.id}**: ${w.name} - ${w.url}`).join('\n')
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in list command:', error);
      await interaction.reply({ content: 'Error fetching website list.', ephemeral: true });
    }
  }

  private async handleCheckCommand(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const websites = await checkAllWebsites();
      const embed = this.createStatusEmbed(websites);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in check command:', error);
      await interaction.editReply('Error checking websites.');
    }
  }

  private createStatusEmbed(websites: any[]) {
    const onlineCount = websites.filter(w => w.status === 'online').length;
    const offlineCount = websites.filter(w => w.status === 'offline').length;
    
    const embed = new EmbedBuilder()
      .setTitle('🌐 Website Status Report')
      .setColor(offlineCount > 0 ? 0xFF0000 : 0x00FF00)
      .setDescription(`**${onlineCount}** online • **${offlineCount}** offline`)
      .setTimestamp();

    websites.forEach(website => {
      const statusEmoji = website.status === 'online' ? '🟢' : '🔴';
      const responseTime = website.response_time ? `${website.response_time}ms` : 'N/A';
      
      embed.addFields({
        name: `${statusEmoji} ${website.name}`,
        value: `**URL**: ${website.url}\n**Response Time**: ${responseTime}\n**Last Checked**: <t:${Math.floor(new Date(website.last_checked).getTime() / 1000)}:R>`,
        inline: true
      });
    });

    return embed;
  }

  private async setupMonitoringChannel() {
    if (!this.config.channelId) return;

    try {
      const channel = await this.client.channels.fetch(this.config.channelId);
      if (channel?.isTextBased()) {
        this.monitoringChannel = channel as TextChannel;
        console.log(`Monitoring channel set to: ${channel.name}`);
      }
    } catch (error) {
      console.error('Error setting up monitoring channel:', error);
    }
  }

  private startPeriodicChecks() {
    const interval = this.config.checkInterval || '*/5 * * * *'; // Every 5 minutes by default
    
    cron.schedule(interval, async () => {
      try {
        console.log('Running periodic website checks...');
        const websites = await checkAllWebsites();
        
        if (this.monitoringChannel) {
          const offlineWebsites = websites.filter(w => w.status === 'offline');
          
          if (offlineWebsites.length > 0) {
            const embed = new EmbedBuilder()
              .setTitle('🚨 Website Alert')
              .setColor(0xFF0000)
              .setDescription(`${offlineWebsites.length} website(s) are currently offline!`)
              .setTimestamp();

            offlineWebsites.forEach(website => {
              embed.addFields({
                name: `🔴 ${website.name}`,
                value: `**URL**: ${website.url}\n**Status**: Offline`,
                inline: true
              });
            });

            await this.monitoringChannel.send({ embeds: [embed] });
          }
        }
      } catch (error) {
        console.error('Error in periodic check:', error);
      }
    });
  }

  async start() {
    try {
      await this.client.login(this.config.token);
    } catch (error) {
      console.error('Error starting bot:', error);
    }
  }

  async stop() {
    await this.client.destroy();
  }
}
