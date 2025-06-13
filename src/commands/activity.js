const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { OWNER_ID, ACTIVITY_CHANNEL_ID } = require('../config');

async function handleActivityCommand(interaction, client) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  const subcommand = interaction.options.getSubcommand();

  try {
    await interaction.deferReply({ flags: 64 });

    switch (subcommand) {
      case 'set':
        const type = interaction.options.getString('type');
        let text = interaction.options.getString('text');
        const url = interaction.options.getString('url');

        if (type === 'STREAMING' && !url) {
          return interaction.editReply({ content: '❌ Streaming activity requires a URL!', flags: 64 });
        }

        client.currentActivity = { type, text, url, containsStats: text.includes('{online}') || text.includes('{total}') };
        await require('../utils/stats').updateBotActivity(client);
        await interaction.editReply({ content: `✅ Activity set to: ${type} ${text}` + (url ? ` (URL: ${url})` : ''), flags: 64 });
        break;

      case 'remove':
        client.currentActivity = null;
        await require('../utils/stats').updateBotActivity(client);
        await interaction.editReply({ content: '✅ Activity removed!', flags: 64 });
        break;

      case 'view':
        if (!client.currentActivity) {
          await interaction.editReply({ content: 'ℹ️ No activity is currently set', flags: 64 });
        } else {
          await interaction.editReply({
            content: `Current activity:\n**Type:** ${client.currentActivity.type}\n**Text:** ${client.currentActivity.text}` +
                     (client.currentActivity.url ? `\n**URL:** ${client.currentActivity.url}` : ''),
            flags: 64
          });
        }
        break;
    }
  } catch (error) {
    console.error('Error handling activity command:', error);
    await interaction.editReply({ content: '❌ Failed to process activity command!', flags: 64 });
  }
}

async function handleSetupActivityCommand(interaction, client) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('view_activity')
        .setLabel('View Your Activity')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎮'),
      new ButtonBuilder()
        .setCustomId('view_leaderboard')
        .setLabel('View Leaderboard')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏆')
    );

  const embed = new EmbedBuilder()
    .setTitle('🎮 Game Activity Tracker')
    .setDescription(
      'Track your playtime automatically while playing games!\n\n' +
      '🏆 **View Leaderboard** \n\n' +
      '📊 View your stats or check out the server leaderboard.\n\n'
    )
    .setColor('#5865F2')
    .setImage('https://i.imgur.com/yxtM4Aw.jpeg')
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter({ text: 'Tracking playtime • Arackal Tharavadu' });

  try {
    const channel = await client.channels.fetch(ACTIVITY_CHANNEL_ID);
    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Activity tracker setup complete!', flags: 64 });
  } catch (error) {
    console.error('Error setting up activity tracker:', error);
    await interaction.reply({ content: '❌ Failed to setup activity tracker!', flags: 64 });
  }
}

async function handleActivityLeaderboard(interaction, userPlaytimes) {
  try {
    const players = Array.from(userPlaytimes.entries())
      .map(([userId, data]) => {
        const time = data.total;
        return { userId, time, games: data.games };
      })
      .filter(p => p.time > 0)
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    if (players.length === 0) {
      return interaction.reply({ content: 'No activity data available yet!', flags: 64 });
    }

    let description = '';
    players.forEach((player, index) => {
      const hours = Math.floor(player.time / 3600);
      const minutes = Math.floor((player.time % 3600) / 60);
      const topGame = Object.entries(player.games)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 1)
        .map(([game]) => game)[0] || 'None';
      description += `**${index + 1}.** <@${player.userId}> - ${hours}h ${minutes}m (Most played: ${topGame})\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle('🏆 Overall Playtime Leaderboard')
      .setDescription(description)
      .setColor('#FEE75C')
      .setFooter({ text: 'Updated every 5 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  } catch (error) {
    console.error('Error handling activity leaderboard:', error);
    await interaction.reply({ content: '❌ Failed to execute activity leaderboard command!', flags: 64 });
  }
}

async function handleSetupNicknameCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('change_nickname')
        .setLabel('Change Now')
        .setStyle(ButtonStyle.Primary)
    );

  try {
    await interaction.channel.send({ components: [row] });
    await interaction.reply({ content: '✅ Name change system setup complete!', flags: 64 });
  } catch (error) {
    console.error('Error setting up nickname change system:', error);
    await interaction.reply({ content: '❌ Failed to setup name change system!', flags: 64 });
  }
}

async function handleNicknameButton(interaction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('nickname_modal')
      .setTitle('Change Name');

    const nicknameInput = new TextInputBuilder()
      .setCustomId('new_nickname')
      .setLabel('Enter your new name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Type your desired name')
      .setRequired(true)
      .setMaxLength(32);

    const actionRow = new ActionRowBuilder().addComponents(nicknameInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  } catch (error) {
    console.error('Error showing nickname modal:', error);
    await interaction.reply({ content: '❌ Failed to show nickname modal!', flags: 64 });
  }
}

async function handleNicknameModal(interaction, client) {
  try {
    const newNickname = interaction.fields.getTextInputValue('new_nickname');
    await interaction.reply({ content: '✅ Your request has been submitted for review.', flags: 64 });
    const owner = await client.users.fetch(OWNER_ID);
    await owner.send(`Nickname change request from ${interaction.user.tag} (${interaction.user.id}):\nNew nickname: ${newNickname}`);

    setTimeout(async () => {
      try {
        await interaction.member.setNickname(newNickname);
        await interaction.user.send(`✅ Your name has been successfully changed to **${newNickname}**!`);
      } catch (error) {
        console.error('Error changing nickname:', error);
        await interaction.user.send('❌ Failed to change your name. Please contact an admin.');
      }
    }, 5000);
  } catch (error) {
    console.error('Error handling nickname modal:', error);
    await interaction.reply({ content: '❌ An error occurred while processing your request.', flags: 64 });
  }
}

module.exports = {
  handleActivityCommand,
  handleSetupActivityCommand,
  handleActivityLeaderboard,
  handleSetupNicknameCommand,
  handleNicknameButton,
  handleNicknameModal,
};
