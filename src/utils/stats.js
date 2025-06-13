const { ActivityType } = require('discord.js');
const { GUILD_ID, STATS_CHANNEL_ID } = require('../config');

let lastMessageId = null;

async function updateStats(client) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch({ withPresences: true });

    const nonBotMembers = guild.members.cache.filter(m => !m.user.bot);
    const online = nonBotMembers.filter(m => m.presence?.status && ['online', 'idle', 'dnd'].includes(m.presence.status)).size;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

    const embed = {
      embeds: [{
        title: '**SERVER STATUS**',
        color: 0xff0000,
        fields: [
          { name: '**> STATUS**', value: '```🟢 Online\n```', inline: true },
          { name: '**> PLAYERS**', value: `\`\`\`👥 ${online}/${nonBotMembers.size}\`\`\``, inline: true },
          { name: '**> INVITE**', value: '```https://discord.gg/22mGfCGAqw\n```' },
        ],
        footer: { text: `Updated every 3 minutes • Today at ${formattedTime}` },
        image: { url: 'https://i.imgur.com/yxtM4Aw.jpeg' },
      }],
    };

    const channel = await client.channels.fetch(STATS_CHANNEL_ID);
    try {
      if (!lastMessageId) {
        const message = await channel.send(embed);
        lastMessageId = message.id;
      } else {
        try {
          await channel.messages.edit(lastMessageId, embed);
        } catch (editError) {
          const message = await channel.send(embed);
          lastMessageId = message.id;
        }
      }
    } catch (sendError) {
      console.error('Failed to send/update stats message:', sendError);
    }
  } catch (error) {
    console.error('Update failed:', error);
  }
}

async function updateBotActivity(client) {
  try {
    const activityTypeMap = {
      'PLAYING': ActivityType.Playing,
      'WATCHING': ActivityType.Watching,
      'LISTENING': ActivityType.Listening,
      'STREAMING': ActivityType.Streaming,
    };

    let activities = [];
    let activityText = client.currentActivity?.text;

    if (client.currentActivity) {
      if (client.currentActivity.containsStats) {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch({ withPresences: true });
        const online = guild.members.cache.filter(m => !m.user.bot && m.presence?.status && ['online', 'idle', 'dnd'].includes(m.presence.status)).size;
        const total = guild.members.cache.filter(m => !m.user.bot).size;
        activityText = activityText.replace('{online}', online).replace('{total}', total);
      }

      const activityOptions = {
        name: activityText,
        type: activityTypeMap[client.currentActivity.type] || ActivityType.Watching,
      };

      if (client.currentActivity.type === 'STREAMING' && client.currentActivity.url) {
        activityOptions.url = client.currentActivity.url;
      }

      activities.push(activityOptions);
    }

    if (client.currentStatus.customText) {
      activities.push({ name: client.currentStatus.customText, type: ActivityType.Custom });
    }

    client.user.setPresence({ status: client.currentStatus.status, activities });
  } catch (error) {
    console.error('Error updating bot presence:', error);
  }
}

module.exports = { updateStats, updateBotActivity };
