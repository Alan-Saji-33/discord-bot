const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { ChannelType } = require('discord.js');

let voiceConnection = null;

async function handleInVcCommand(interaction) {
  try {
    await interaction.deferReply({ flags: 64 });
    const channel = interaction.options.getChannel('channel');

    if (channel.type !== ChannelType.GuildVoice) {
      return await interaction.editReply({ content: '❌ Please select a valid voice channel!', flags: 64 });
    }

    const existingConnection = getVoiceConnection(interaction.guildId);
    if (existingConnection) {
      return await interaction.editReply({ content: '❌ The bot is already in a voice channel!', flags: 64 });
    }

    voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    voiceConnection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`✅ Bot joined voice channel: ${channel.name}`);
    });

    voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
      voiceConnection = null;
      console.log('ℹ️ Bot disconnected from voice channel');
    });

    await interaction.editReply({ content: `✅ Bot has joined the voice channel: ${channel.name}!`, flags: 64 });
  } catch (error) {
    console.error('Error joining voice channel:', error);
    await interaction.editReply({ content: '❌ Failed to join the voice channel!', flags: 64 });
  }
}

async function handleOutVcCommand(interaction) {
  try {
    await interaction.deferReply({ flags: 64 });
    const existingConnection = getVoiceConnection(interaction.guildId);
    if (!existingConnection) {
      return await interaction.editReply({ content: '❌ The bot is not in a voice channel!', flags: 64 });
    }

    existingConnection.destroy();
    voiceConnection = null;
    await interaction.editReply({ content: '✅ Bot has left the voice channel!', flags: 64 });
  } catch (error) {
    console.error('Error leaving voice channel:', error);
    await interaction.editReply({ content: '❌ Failed to leave the voice channel!', flags: 64 });
  }
}

module.exports = { handleInVcCommand, handleOutVcCommand };
