const { handleHiCommand, handleOnlineMembersCommand, handleHelpCommand } = require('../commands/general');
const { handleEmbedCommand, handleSendDMCommand, handleSendMessageCommand, handleSetStatusCommand, handleClearStatusCommand } = require('../commands/admin');
const { handleActivityCommand, handleSetupActivityCommand, handleActivityLeaderboard, handleSetupNicknameCommand, handleNicknameButton, handleNicknameModal } = require('../commands/activity');
const { handleKickCommand, handleBanCommand, handleTimeoutCommand, handleClearCommand } = require('../commands/moderation');
const { handleInVcCommand, handleOutVcCommand } = require('../commands/voice');
const { EmbedBuilder } = require('discord.js');
const { userPlaytimes } = require('../utils/playtime');

async function handleButtonInteraction(interaction, client) {
  try {
    switch (interaction.customId) {
      case 'hi_command':
        await handleHiCommand(interaction, interaction.user);
        break;
      case 'online_command':
        await handleOnlineMembersCommand(interaction, interaction.guild);
        break;
      case 'serverinfo_command':
        if (!interaction.guild) {
          await interaction.reply({ content: '❌ This command only works in servers!', flags: 64 });
          return;
        }
        const guild = interaction.guild;
        const serverEmbed = new EmbedBuilder()
          .setTitle(guild.name)
          .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
          .addFields(
            { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:D>`, inline: true },
            { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
            { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: '✨ Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
          )
          .setColor('#5865F2')
          .setFooter({ text: `Server ID: ${guild.id}` });
        await interaction.reply({ embeds: [serverEmbed], flags: 64 });
        break;
      case 'view_activity': {
        const userId = interaction.user.id;
        const userData = userPlaytimes.get(userId) || { games: {}, total: 0 };
        let description = '**Your Game Activity:**\n\n';
        if (Object.keys(userData.games).length === 0) {
          description += 'No tracked game activity found.\nPlay some games to see your stats here!';
        } else {
          for (const [game, seconds] of Object.entries(userData.games)) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            description += `**${game}**: ${hours}h ${minutes}m\n`;
          }
          const totalHours = Math.floor(userData.total / 3600);
          const totalMinutes = Math.floor((userData.total % 3600) / 60);
          description += `\n**Total Playtime**: ${totalHours}h ${totalMinutes}m`;
        }
        const activityEmbed = new EmbedBuilder()
          .setTitle(`🎮 ${interaction.user.username}'s Activity`)
          .setDescription(description)
          .setColor('#5865F2')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();
        await interaction.reply({ embeds: [activityEmbed], flags: 64 });
        break;
      }
      case 'view_leaderboard':
        await handleActivityLeaderboard(interaction, userPlaytimes);
        break;
      case 'change_nickname':
        await handleNicknameButton(interaction);
        break;
    }
  } catch (error) {
    console.error('Button interaction error:', error);
    await interaction.reply({ content: '❌ An error occurred while processing your request', flags: 64 });
  }
}

async function handleInteractionCreate(client, interaction) {
  try {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case 'hi':
          await handleHiCommand(interaction, interaction.user);
          break;
        case 'online_members':
          await handleOnlineMembersCommand(interaction, interaction.guild);
          break;
        case 'help':
          await handleHelpCommand(interaction, client);
          break;
        case 'embed':
          await handleEmbedCommand(interaction);
          break;
        case 'send_dm':
          await handleSendDMCommand(interaction);
          break;
        case 'send_message':
          await handleSendMessageCommand(interaction);
          break;
        case 'activity':
          await handleActivityCommand(interaction, client);
          break;
        case 'set_status':
          await handleSetStatusCommand(interaction, client);
          break;
        case 'clear_status':
          await handleClearStatusCommand(interaction, client);
          break;
        case 'setup_activity':
          await handleSetupActivityCommand(interaction, client);
          break;
        case 'activity_leaderboard':
          await handleActivityLeaderboard(interaction, userPlaytimes);
          break;
        case 'setup_nickname':
          await handleSetupNicknameCommand(interaction);
          break;
        case 'invc':
          await handleInVcCommand(interaction);
          break;
        case 'outvc':
          await handleOutVcCommand(interaction);
          break;
        case 'kick':
          await handleKickCommand(interaction);
          break;
        case 'ban':
          await handleBanCommand(interaction);
          break;
        case 'timeout':
          await handleTimeoutCommand(interaction);
          break;
        case 'clear':
          await handleClearCommand(interaction);
          break;
        default:
          await interaction.reply({ content: '❌ Unknown command', flags: 64 });
      }
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction, client);
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'nickname_modal') {
        await handleNicknameModal(interaction, client);
      }
    }
  } catch (error) {
    console.error('Interaction error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred while processing your command!', flags: 64 });
    } else {
      await interaction.followUp({ content: '❌ An error occurred while processing your command!', flags: 64 });
    }
  }
}

module.exports = { handleInteractionCreate };
