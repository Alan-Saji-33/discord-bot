const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { OWNER_ID } = require('../config');

async function handleVoiceStateUpdate(client, oldState, newState) {
  try {
    if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
      const user = newState.member.user;
      if (user.bot || user.id === OWNER_ID) return;

      const channel = newState.guild.channels.cache.get(newState.channelId);
      const owner = await client.users.fetch(OWNER_ID);

      const voiceEmbed = new EmbedBuilder()
        .setTitle('Voice Channel Activity')
        .setDescription(`${user.tag} has joined a voice channel.`)
        .addFields(
          { name: 'User', value: `<@${user.id}>`, inline: true },
          { name: 'Channel', value: channel.name, inline: true }
        )
        .setColor('#5d00ff')
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Join Voice Channel')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${newState.guild.id}/${newState.channelId}`)
        );

      await owner.send({ embeds: [voiceEmbed], components: [row] }).catch(err => {
        console.error(`Failed to DM owner about voice channel activity for ${user.tag}:`, err);
      });
    }
  } catch (error) {
    console.error('Error in voiceStateUpdate:', error);
  }
}

module.exports = { handleVoiceStateUpdate };
