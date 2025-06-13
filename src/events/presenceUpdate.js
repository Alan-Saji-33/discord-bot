const { ActivityType } = require('discord.js');
const { userPlaytimes, activeSessions } = require('../utils/playtime');
const { updateStats, updateBotActivity } = require('../utils/stats');

async function handlePresenceUpdate(client, oldPresence, newPresence) {
  if (!newPresence || !newPresence.member || newPresence.member.user.bot) return;

  const userId = newPresence.member.user.id;
  const now = Date.now();

  if (!userPlaytimes.has(userId)) {
    userPlaytimes.set(userId, { lastUpdate: now, games: {}, total: 0 });
  }

  const userData = userPlaytimes.get(userId);
  const currentGames = new Set(newPresence.activities
    .filter(activity => activity.type === ActivityType.Playing)
    .map(activity => activity.name));

  const previousSession = activeSessions.get(userId) || {};

  for (const [game, startTime] of Object.entries(previousSession)) {
    if (currentGames.has(game)) {
      const timeElapsed = (now - startTime) / 1000;
      if (timeElapsed > 0) {
        userData.games[game] = (userData.games[game] || 0) + timeElapsed;
        userData.total += timeElapsed;
        previousSession[game] = now;
      }
    } else {
      const timeElapsed = (now - startTime) / 1000;
      if (timeElapsed > 0) {
        userData.games[game] = (userData.games[game] || 0) + timeElapsed;
        userData.total += timeElapsed;
      }
      delete previousSession[game];
    }
  }

  const newSession = { ...previousSession };
  currentGames.forEach(game => {
    if (!previousSession[game]) {
      newSession[game] = now;
    }
  });

  if (Object.keys(newSession).length > 0) {
    activeSessions.set(userId, newSession);
  } else {
    activeSessions.delete(userId);
  }

  userData.lastUpdate = now;
  userPlaytimes.set(userId, userData);

  await updateStats(client);
  await updateBotActivity(client);
}

module.exports = { handlePresenceUpdate };
