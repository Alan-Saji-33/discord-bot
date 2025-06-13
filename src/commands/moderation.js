const { EmbedBuilder } = require('discord.js');

async function handleKickCommand(interaction) {
  if (!interaction.member.permissions.has('KickMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to kick members.', flags: 64 });
  }

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: '❌ User not found in the server.', flags: 64 });
  }

  if (!member.kickable) {
    return interaction.reply({ content: '❌ I cannot kick this user (e.g., they have a higher role or I lack permissions).', flags: 64 });
  }

  try {
    await interaction.deferReply({ flags: 64 });
    const kickEmbed = new EmbedBuilder()
      .setTitle('You Have Been Kicked')
      .setDescription(`You were kicked from **${interaction.guild.name}**.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      )
      .setColor('#FF0000')
      .setImage('https://i.ibb.co/Jw0Z2Lkq/standard-1.gif')
      .setTimestamp();

    await user.send({ embeds: [kickEmbed] }).catch(err => console.error(`Failed to DM ${user.tag} about kick:`, err));
    await member.kick(reason);
    await interaction.editReply({ content: `✅ Successfully kicked ${user.tag} for: ${reason}`, flags: 64 });
  } catch (error) {
    console.error('Error kicking user:', error);
    await interaction.editReply({ content: '❌ Failed to kick the user!', flags: 64 });
  }
}

async function handleBanCommand(interaction) {
  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to ban members.', flags: 64 });
  }

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: '❌ User not found in the server.', flags: 64 });
  }

  if (!member.bannable) {
    return interaction.reply({ content: '❌ I cannot ban this user (e.g., they have a higher role or I lack permissions).', flags: 64 });
  }

  try {
    await interaction.deferReply({ flags: 64 });
    const banEmbed = new EmbedBuilder()
      .setTitle('You Have Been Banned')
      .setDescription(`You were banned from **${interaction.guild.name}**.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      )
      .setColor('#FF0000')
      .setImage('https://i.ibb.co/Jw0Z2Lkq/standard-1.gif')
      .setTimestamp();

    await user.send({ embeds: [banEmbed] }).catch(err => console.error(`Failed to DM ${user.tag} about ban:`, err));
    await interaction.guild.members.ban(user, { reason });
    await interaction.editReply({ content: `✅ Successfully banned ${user.tag} for: ${reason}`, flags: 64 });
  } catch (error) {
    console.error('Error banning user:', error);
    await interaction.editReply({ content: '❌ Failed to ban the user!', flags: 64 });
  }
}

async function handleTimeoutCommand(interaction) {
  if (!interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to timeout members.', flags: 64 });
  }

  const user = interaction.options.getUser('user');
  const duration = interaction.options.getInteger('duration');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: '❌ User not found in the server.', flags: 64 });
  }

  if (!member.moderatable) {
    return interaction.reply({ content: '❌ I cannot timeout this user (e.g., they have a higher role or I lack permissions).', flags: 64 });
  }

  try {
    await interaction.deferReply({ flags: 64 });
    const timeoutUntil = new Date(Date.now() + duration * 60 * 1000);
    const timeoutEmbed = new EmbedBuilder()
      .setTitle('You Have Been Timed Out')
      .setDescription(`You were timed out in **${interaction.guild.name}**.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Duration', value: `${duration} minutes`, inline: true },
        { name: 'Timeout Ends', value: `<t:${Math.floor(timeoutUntil / 1000)}:R>`, inline: true }
      )
      .setColor('#FFA500')
      .setImage('https://i.ibb.co/Z1MVQrb7/standard-2.gif')
      .setTimestamp();

    await user.send({ embeds: [timeoutEmbed] }).catch(err => console.error(`Failed to DM ${user.tag} about timeout:`, err));
    await member.timeout(duration * 60 * 1000, reason);
    await interaction.editReply({ content: `✅ Successfully timed out ${user.tag} for ${duration} minutes. Reason: ${reason}`, flags: 64 });
  } catch (error) {
    console.error('Error timing out user:', error);
    await interaction.editReply({ content: '❌ Failed to timeout the user!', flags: 64 });
  }
}

async function handleClearCommand(interaction) {
  if (!interaction.member.permissions.has('ManageMessages')) {
    return interaction.reply({ content: '⛔️ You do not have permission to manage messages.', flags: 64 });
  }

  const amount = interaction.options.getInteger('amount');
  const user = interaction.options.getUser('user');

  try {
    await interaction.deferReply({ flags: 64 });
    const channel = interaction.channel;
    let messages;

    if (user) {
      messages = await channel.messages.fetch({ limit: 100 });
      messages = messages.filter(msg => msg.author.id === user.id);
      if (amount) messages = messages.first(amount);
    } else if (amount) {
      messages = await channel.messages.fetch({ limit: amount });
    } else {
      messages = await channel.messages.fetch({ limit: 100 });
    }

    if (messages.size === 0) {
      return interaction.editReply({ content: '❌ No messages found to delete.', flags: 64 });
    }

    await channel.bulkDelete(messages, true);
    await interaction.editReply({ content: `✅ Successfully deleted ${messages.size} messages${user ? ` from ${user.tag}` : ''}.`, flags: 64 });
  } catch (error) {
    console.error('Error clearing messages:', error);
    await interaction.editReply({ content: '❌ Failed to clear messages! Ensure I have the correct permissions.', flags: 64 });
  }
}

module.exports = { handleKickCommand, handleBanCommand, handleTimeoutCommand, handleClearCommand };
