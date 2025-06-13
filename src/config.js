require('dotenv').config();

const requiredEnvVars = ['BOT_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'OWNER_ID', 'STATS_CHANNEL_ID', 'ACTIVITY_CHANNEL_ID', 'WELCOME_CHANNEL_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  OWNER_ID: process.env.OWNER_ID,
  STATS_CHANNEL_ID: process.env.STATS_CHANNEL_ID,
  ACTIVITY_CHANNEL_ID: process.env.ACTIVITY_CHANNEL_ID,
  WELCOME_CHANNEL_ID: process.env.WELCOME_CHANNEL_ID,
  PORT: process.env.PORT || 3000,
  WELCOME_IMAGE_URL: 'https://i.ibb.co/5gfHdw6J/standard.gif',
};
