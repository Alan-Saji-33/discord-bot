const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');
const { CLIENT_ID, BOT_TOKEN } = require('../config');

async function registerCommands(client) {
  const commands = [
    new SlashCommandBuilder().setName('hi').setDescription('Greet the user with a custom message.'),
    new SlashCommandBuilder().setName('online_members').setDescription('Display a list of online members.'),
    new SlashCommandBuilder().setName('help').setDescription('Show all available commands.'),
    new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Send a custom embed message (Owner only)')
      .addStringOption(option => option.setName('title').setDescription('The title of the embed').setRequired(true))
      .addStringOption(option => option.setName('description').setDescription('The description of the embed (use \\n for new lines)').setRequired(true))
      .addStringOption(option => option.setName('image').setDescription('URL of the image to include').setRequired(false))
      .addStringOption(option => option.setName('thumbnail').setDescription('URL of the thumbnail to include').setRequired(false))
      .addStringOption(option => option.setName('footer').setDescription('Footer text for the embed').setRequired(false))
      .addStringOption(option => option.setName('button1').setDescription('First button text').setRequired(false))
      .addStringOption(option => option.setName('button1url').setDescription('First button URL').setRequired(false))
      .addStringOption(option => option.setName('button1emoji').setDescription('First button emoji (format: name:id)').setRequired(false))
      .addStringOption(option => option.setName('button2').setDescription('Second button text').setRequired(false))
      .addStringOption(option => option.setName('button2url').setDescription('Second button URL').setRequired(false))
      .addStringOption(option => option.setName('button2emoji').setDescription('Second button emoji (format: name:id)').setRequired(false))
      .addBooleanOption(option => option.setName('timestamp').setDescription('Add timestamp to embed?').setRequired(false))
      .addChannelOption(option => option.setName('channel').setDescription('Channel to send the embed to').setRequired(false))
      .addRoleOption(option => option.setName('mention').setDescription('Role to mention (@role)').setRequired(false)),
    new SlashCommandBuilder()
      .setName('send_dm')
      .setDescription('Send a direct message to a user (Owner only)')
      .addUserOption(option => option.setName('user').setDescription('The user to send the DM to').setRequired(true))
      .addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true)),
    new SlashCommandBuilder()
      .setName('send_message')
      .setDescription('Send a message to the current channel (Owner only)')
      .addStringOption(option => option.setName('message').setDescription('The message to send (use \\n for new lines)').setRequired(true))
      .addAttachmentOption(option => option.setName('file').setDescription('Attach a PNG or JPEG file (optional)').setRequired(false))
      .addRoleOption(option => option.setName('mention').setDescription('Role to mention (optional)').setRequired(false)),
    new SlashCommandBuilder()
      .setName('activity')
      .setDescription('Control the bot\'s activity (e.g., Watching, Playing)')
      .addSubcommand(subcommand =>
        subcommand.setName('set')
          .setDescription('Set a new activity')
          .addStringOption(option => option.setName('type').setDescription('Activity type').setRequired(true)
            .addChoices({ name: 'Playing', value: 'PLAYING' }, { name: 'Watching', value: 'WATCHING' }, { name: 'Listening', value: 'LISTENING' }, { name: 'Streaming', value: 'STREAMING' }))
          .addStringOption(option => option.setName('text').setDescription('Activity text (use {online} and {total} for counts)').setRequired(true))
          .addStringOption(option => option.setName('url').setDescription('Streaming URL (only for STREAMING type)').setRequired(false)))
      .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Remove the current activity'))
      .addSubcommand(subcommand => subcommand.setName('view').setDescription('View the current activity settings')),
    new SlashCommandBuilder()
      .setName('set_status')
      .setDescription('Set custom bot status (Owner only)')
      .addStringOption(option => option.setName('status').setDescription('Status type').setRequired(true)
        .addChoices({ name: 'Online', value: 'online' }, { name: 'Idle', value: 'idle' }, { name: 'Do Not Disturb', value: 'dnd' }, { name: 'Invisible', value: 'invisible' }))
      .addStringOption(option => option.setName('text').setDescription('Custom status text').setRequired(true)),
    new SlashCommandBuilder().setName('clear_status').setDescription('Clear the bot\'s custom status (Owner only)'),
    new SlashCommandBuilder().setName('setup_activity').setDescription('Setup the activity tracking system (Owner only)'),
    new SlashCommandBuilder().setName('activity_leaderboard').setDescription('Show top players by playtime'),
    new SlashCommandBuilder().setName('setup_nickname').setDescription('Setup the nickname change system (Owner only)'),
    new SlashCommandBuilder()
      .setName('invc')
      .setDescription('Make the bot join a specified voice channel')
      .addChannelOption(option => option.setName('channel').setDescription('The voice channel to join').setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
    new SlashCommandBuilder().setName('outvc').setDescription('Make the bot leave the voice channel'),
    new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a user from the server (Moderators only)')
      .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
      .addStringOption(option => option.setName('reason').setDescription('Reason for the kick').setRequired(false)),
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a user from the server (Moderators only)')
      .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
      .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setRequired(false)),
    new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('Timeout a user for a specified duration (Moderators only)')
      .addUserOption(option => option.setName('user').setDescription('The user to timeout').setRequired(true))
      .addIntegerOption(option => option.setName('duration').setDescription('Duration of the timeout in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption(option => option.setName('reason').setDescription('Reason for the timeout').setRequired(false)),
    new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Clear messages in the channel (Moderators only)')
      .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(false).setMinValue(1).setMaxValue(100))
      .addUserOption(option => option.setName('user').setDescription('Delete messages from a specific user').setRequired(false)),
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

module.exports = { registerCommands };
