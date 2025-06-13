const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');
const { config } = require('./config');
const { registerCommands } = require('./utils/helpers');
const { loadPlaytimeData, setupPlaytimeSaver } = require('./utils/playtime');
const { updateStats, updateBotActivity } = require('./utils/stats');
const { handleGuildMemberAdd } = require('./events/guildMemberAdd');
const { handleInteractionCreate } = require('./events/interactionCreate');
const { handlePresenceUpdate } = require('./events/presenceUpdate');
const { handleVoiceStateUpdate } = require('./events/voiceStateUpdate');

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('Bot is running and ready!'));
app.listen(config.PORT, () => console.log(`🌐 Web server running on port ${config.PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Global state
client.currentStatus = { status: 'online', customText: null };
client.currentActivity = {
  type: 'WATCHING',
  text: '[{online}/{total}] players online',
  url: null,
  containsStats: true,
};

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  loadPlaytimeData();
  setupPlaytimeSaver();
  await updateBotActivity(client);
  await registerCommands(client);
  await updateStats(client);
  setInterval(() => {
    updateStats(client);
    updateBotActivity(client);
  }, 180000);
});

// Event listeners
client.on('guildMemberAdd', member => handleGuildMemberAdd(client, member));
client.on('interactionCreate', interaction => handleInteractionCreate(client, interaction));
client.on('presenceUpdate', (oldPresence, newPresence) => handlePresenceUpdate(client, oldPresence, newPresence));
client.on('voiceStateUpdate', (oldState, newState) => handleVoiceStateUpdate(client, oldState, newState));

// Global error handlers
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection at:', promise, 'reason:', reason));

client.login(config.BOT_TOKEN);
