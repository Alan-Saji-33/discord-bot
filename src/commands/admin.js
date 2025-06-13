const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { OWNER_ID } = require('../config');

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

async function handleEmbedCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  const title = interaction.options.getString('title');
  let description = interaction.options.getString('description');
  const image = interaction.options.getString('image');
  const thumbnail = interaction.options.getString('thumbnail');
  const footer = interaction.options.getString('footer');
  const button1 = interaction.options.getString('button1');
  const button1url = interaction.options.getString('button1url');
  const button1emoji = interaction.options.getString('button1emoji');
  const button2 = interaction.options.getString('button2');
  const button2url = interaction.options.getString('button2url');
  const button2emoji = interaction.options.getString('button2emoji');
  const timestamp = interaction.options.getBoolean('timestamp') || false;
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
  const mentionRole = interaction.options.getRole('mention');

  description = description.replace(/\\n/g, '\n');

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0xd90707);

  if (image) embed.setImage(image);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (footer) embed.setFooter({ text: footer });
  if (timestamp) embed.setTimestamp();

  const row = new ActionRowBuilder();

  if (button1 && button1url && isValidUrl(button1url)) {
    const button = new ButtonBuilder()
      .setLabel(button1)
      .setStyle(ButtonStyle.Link)
      .setURL(button1url);
    if (button1emoji) {
      const emojiParts = button1emoji.split(':');
      if (emojiParts.length === 2) {
        button.setEmoji({ name: emojiParts[0], id: emojiParts[1] });
      }
    }
    row.addComponents(button);
  }

  if (button2 && button2url && isValidUrl(button2url)) {
    const button = new ButtonBuilder()
      .setLabel(button2)
      .setStyle(ButtonStyle.Link)
      .setURL(button2url);
    if (button2emoji) {
      const emojiParts = button2emoji.split(':');
      if (emojiParts.length === 2) {
        button.setEmoji({ name: emojiParts[0], id: emojiParts[1] });
      }
    }
    row.addComponents(button);
  }

  try {
    await interaction.deferReply({ flags: 64 });
    let messageContent = mentionRole ? `${mentionRole}` : '';
    await targetChannel.send({
      content: messageContent,
      embeds: [embed],
      components: row.components.length > 0 ? [row] : [],
      allowedMentions: { roles: mentionRole ? [mentionRole.id] : [] }
    });
    await interaction.editReply({
      content: `✅ Embed sent successfully to ${targetChannel}!` + (mentionRole ? ` with ${mentionRole.name} mention` : ''),
      flags: 64
    });
  } catch (error) {
    console.error('❌ Error sending embed:', error);
    await interaction.editReply({ content: '❌ There was an error sending the embed!', flags: 64 });
  }
}

async function handleSendDMCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  const user = interaction.options.getUser('user');
  const message = interaction.options.getString('message');

  try {
    await interaction.deferReply({ flags: 64 });
    await user.send(message);
    await interaction.editReply({ content: `✅ DM sent successfully to ${user.tag}!`, flags: 64 });
  } catch (error) {
    console.error('❌ Error sending DM:', error);
    await interaction.editReply({ content: '❌ There was an error sending the DM! The user might have DMs disabled.', flags: 64 });
  }
}

async function handleSendMessageCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  const message = interaction.options.getString('message').replace(/\\n/g, '\n');
  const mentionRole = interaction.options.getRole('mention');
  const fileAttachment = interaction.options.getAttachment('file');
  const channel = interaction.channel;

  let files = [];
  if (fileAttachment) {
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const extension = fileAttachment.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return interaction.reply({ content: '❌ Only PNG and JPEG files are allowed!', flags: 64 });
    }
    files = [{ attachment: fileAttachment.url, name: fileAttachment.name }];
  }

  try {
    await interaction.deferReply({ flags: 64 });
    let messageContent = mentionRole ? `${mentionRole}\n${message}` : message;
    await channel.send({
      content: messageContent,
      files: files.length > 0 ? files : undefined,
      allowedMentions: { roles: mentionRole ? [mentionRole.id] : [] }
    });
    await interaction.editReply({
      content: `✅ Message sent successfully to ${channel}!` + 
               (mentionRole ? ` with ${mentionRole.name} mention` : '') +
               (fileAttachment ? ` with file ${fileAttachment.name}` : ''),
      flags: 64
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    await interaction.editReply({ content: '❌ There was an error sending the message or file!', flags: 64 });
  }
}

async function handleSetStatusCommand(interaction, client) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  try {
    await interaction.deferReply({ flags: 64 });
    const status = interaction.options.getString('status');
    const customText = interaction.options.getString('text');
    client.currentStatus = { status, customText };
    await require('../utils/stats').updateBotActivity(client);
    await interaction.editReply({ content: `✅ Status set to ${status} with text: ${customText}`, flags: 64 });
  } catch (error) {
    console.error('Error setting custom status:', error);
    await interaction.editReply({ content: '❌ Failed to set custom status!', flags: 64 });
  }
}

async function handleClearStatusCommand(interaction, client) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: 64 });
  }

  try {
    await interaction.deferReply({ flags: 64 });
    client.currentStatus = { status: 'online', customText: null };
    await require('../utils/stats').updateBotActivity(client);
    await interaction.editReply({ content: '✅ Custom status cleared!', flags: 64 });
  } catch (error) {
    console.error('Error clearing custom status:', error);
    await interaction.editReply({ content: '❌ Failed to clear custom status!', flags: 64 });
  }
}

module.exports = { handleEmbedCommand, handleSendDMCommand, handleSendMessageCommand, handleSetStatusCommand, handleClearStatusCommand };
