const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function handleHiCommand(interaction, user) {
  try {
    const hiEmbed = new EmbedBuilder()
      .setTitle(`👋 Hello ${user.username}!`)
      .setDescription(`This is the official Discord bot of **Arackal Tharavadu**, developed by **@hyper.hawk**!\n\nFeel free to explore and interact!`)
      .setColor('#5865F2')
      .setImage('https://i.imgur.com/yxtM4Aw.jpeg')
      .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [hiEmbed], flags: 64 });
  } catch (error) {
    console.error('Error handling hi command:', error);
    await interaction.reply({ content: '❌ Failed to execute hi command!', flags: 64 });
  }
}

async function handleOnlineMembersCommand(interaction, guild) {
  try {
    await interaction.deferReply({ flags: 64 });

    if (!guild) {
      return interaction.editReply({ content: '❌ This command can only be used inside a server.', flags: 64 });
    }

    if (guild.members.cache.size < guild.memberCount) {
      await guild.members.fetch({ withPresences: true });
    }

    const onlineMembers = guild.members.cache.filter(m => 
      !m.user.bot && m.presence?.status && ['online', 'idle', 'dnd'].includes(m.presence.status)
    );

    if (onlineMembers.size === 0) {
      return interaction.editReply({ content: 'ℹ️ No online members found.', flags: 64 });
    }

    const statusGroups = {
      online: [],
      idle: [],
      dnd: [],
    };

    onlineMembers.forEach(member => {
      const status = member.presence.status;
      const nickname = member.nickname || member.user.username;
      const statusEmoji = { online: '🟢', idle: '🟡', dnd: '🔴' }[status];
      statusGroups[status].push(`${statusEmoji} **${nickname}**`);
    });

    let description = '';
    if (statusGroups.online.length > 0) {
      description += `### Online (${statusGroups.online.length})\n${statusGroups.online.join('\n')}\n\n`;
    }
    if (statusGroups.idle.length > 0) {
      description += `### Idle (${statusGroups.idle.length})\n${statusGroups.idle.join('\n')}\n\n`;
    }
    if (statusGroups.dnd.length > 0) {
      description += `### Do Not Disturb (${statusGroups.dnd.length})\n${statusGroups.dnd.join('\n')}\n\n`;
    }

    const totalMembers = guild.memberCount;
    const onlineCount = statusGroups.online.length;
    const idleCount = statusGroups.idle.length;
    const dndCount = statusGroups.dnd.length;
    const activeCount = onlineCount + idleCount + dndCount;
    const onlinePercentage = Math.round((activeCount / totalMembers) * 100);

    description += `### Server Activity\n`
                 + `🟢 **${onlineCount}** Online | 🟡 **${idleCount}** Idle | 🔴 **${dndCount}** DND\n`
                 + `👥 **${activeCount}/${totalMembers}** members active (${onlinePercentage}%)`;

    const onlineEmbed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name} Member Status`)
      .setDescription(description)
      .setColor('#57F287')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [onlineEmbed], flags: 64 });
  } catch (error) {
    console.error('Error handling online members command:', error);
    await interaction.editReply({ content: '❌ Failed to execute online members command!', flags: 64 });
  }
}

async function handleHelpCommand(interaction, client) {
  try {
    const commandButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('hi_command')
          .setLabel('Say Hello')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👋'),
        new ButtonBuilder()
          .setCustomId('online_command')
          .setLabel('Online Members')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🟢'),
        new ButtonBuilder()
          .setCustomId('serverinfo_command')
          .setLabel('Server Info')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('ℹ️')
      );

    const helpEmbed = new EmbedBuilder()
      .setTitle('🤖 Bot Commands Help')
      .setDescription('Click the buttons below to execute commands or use the slash commands!\n\n' +
                      '**Note**: `/set_status` sets the bot\'s status (e.g., Online, Idle) and custom text. ' +
                      '`/activity` sets the bot\'s activity (e.g., Watching, Playing). Both can be used together.')
      .addFields(
        { name: '👋 /hi', value: 'Get a friendly greeting', inline: true },
        { name: '🟢 /online_members', value: 'See who\'s active in the server', inline: true },
        { name: '📝 /embed', value: 'Create custom embeds (Owner only)', inline: true },
        { name: '📩 /send_dm', value: 'Send DMs to users (Owner only)', inline: true },
        { name: '💬 /send_message', value: 'Send simple messages (Owner only)', inline: true },
        { name: '🎮 /activity', value: 'Set bot\'s activity (e.g., Watching)', inline: true },
        { name: '🎮 /set_status', value: 'Set custom status (Owner only)', inline: true },
        { name: '🎮 /clear_status', value: 'Clear custom status (Owner only)', inline: true },
        { name: '🎮 /setup_activity', value: 'Setup activity tracking (Owner only)', inline: true },
        { name: '🏆 /activity_leaderboard', value: 'Show top players by playtime', inline: true },
        { name: '✏️ /setup_nickname', value: 'Setup nickname change system (Owner only)', inline: true },
        { name: '🔊 /invc', value: 'Make bot join voice channel', inline: true },
        { name: '🔇 /outvc', value: 'Make bot leave voice channel', inline: true },
        { name: '👢 /kick', value: 'Kick a user (Moderators only)', inline: true },
        { name: '🚫 /ban', value: 'Ban a user (Moderators only)', inline: true },
        { name: '⏳ /timeout', value: 'Timeout a user (Moderators only)', inline: true },
        { name: '🗑️ /clear', value: 'Clear messages in a channel (Moderators only)', inline: true },
        { name: 'ℹ️ Server Info', value: 'View server statistics (button only)', inline: true }
      )
      .setColor('#5865F2')
      .setFooter({ text: `${client.user.username} • Click buttons to execute commands`, iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [helpEmbed], components: [commandButtons], flags: 64 });
  } catch (error) {
    console.error('Error handling help command:', error);
    await interaction.reply({ content: '❌ Failed to execute help command!', flags: 64 });
  }
}

module.exports = { handleHiCommand, handleOnlineMembersCommand, handleHelpCommand };
