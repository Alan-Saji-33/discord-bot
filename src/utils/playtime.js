const fs = require('fs');

const userPlaytimes = new Map();
const activeSessions = new Map();

function loadPlaytimeData() {
  try {
    if (fs.existsSync('./playtimes.json')) {
      const data = fs.readFileSync('./playtimes.json', 'utf-8');
      if (!data || data.trim() === '') {
        console.warn('⚠️ playtimes.json is empty. Initializing with empty object.');
        fs.writeFileSync('./playtimes.json', JSON.stringify({}));
        return;
      }
      try {
        const parsed = JSON.parse(data);
        for (const [userId, userData] of Object.entries(parsed)) {
          if (userData && typeof userData.games === 'object' && typeof userData.total === 'number') {
            userPlaytimes.set(userId, userData);
          } else {
            console.warn(`⚠️ Invalid data for user ${userId}. Skipping.`);
          }
        }
        console.log('✅ Loaded playtime data');
      } catch (parseError) {
        console.error('❌ Error parsing playtimes.json:', parseError);
        fs.writeFileSync('./playtimes.json', JSON.stringify({}));
      }
    } else {
      console.log('ℹ️ playtimes.json does not exist. Creating empty file.');
      fs.writeFileSync('./playtimes.json', JSON.stringify({}));
    }
  } catch (err) {
    console.error('❌ Error loading playtime data:', err);
  }
}

function setupPlaytimeSaver() {
  setInterval(() => {
    const data = {};
    userPlaytimes.forEach((value, key) => {
      data[key] = value;
    });
    fs.writeFileSync('./playtimes.json', JSON.stringify(data));
    console.log('💾 Saved playtime data');
  }, 300000);
}

module.exports = { userPlaytimes, activeSessions, loadPlaytimeData, setupPlaytimeSaver };
