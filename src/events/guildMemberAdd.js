const { EmbedBuilder } = require('discord.js');
const { WELCOME_CHANNEL_ID, WELCOME_IMAGE_URL } = require('../config');

async function handleGuildMemberAdd(client, member) {
  try {
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!welcomeChannel) {
      console.error('Welcome channel not found');
      return;
    }

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Welcome!`)
      .setDescription(`Hey ${member}, welcome to Arackal Tharavadu!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage(WELCOME_IMAGE_URL)
      .addFields(
        { name: '\u200B', value: '<#1360132549757636780> Server Status' },
        { name: '', value: '<#1375516948548554752> Change Your Name' },
        { name: '', value: '<#1374273022940286977> View Your Activity' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Name', value: `${member.user.username}`, inline: true },
        { name: 'Joined Date', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: 'Arackal Tharavadu' })
      .setTimestamp();

    await welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] });
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

module.exports = { handleGuildMemberAdd };
