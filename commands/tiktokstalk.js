const axios = require('axios');

module.exports = {
  name: 'tiktokstalk',
  category: 'search menu',
  description: 'Lookup TikTok user profile info',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const username = args[0];
    if (!username) return sock.sendMessage(from, { text: '❌ Usage: .tiktokstalk <username>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/stalk/tiktok?username=${encodeURIComponent(username)}`);
      console.log('TikTok API response:', JSON.stringify(res.data, null, 2)); // Log full response
      const data = res.data;
      
      // Check different possible success indicators and data paths
      let user = null;
      if (data.success && data.result) user = data.result;
      else if (data.status === true && data.data) user = data.data;
      else if (data.user) user = data.user;
      else if (data) user = data; // fallback
      
      if (user && (user.uniqueId || user.username)) {
        const text = `🎵 *TikTok Stalk*\n\n` +
          `📛 Username: ${user.uniqueId || user.username}\n` +
          `👤 Name: ${user.nickname || user.name || '-'}\n` +
          `✔️ Verified: ${user.verified ? 'Yes' : 'No'}\n` +
          `👥 Followers: ${user.followerCount || user.followers || 0}\n` +
          `👣 Following: ${user.followingCount || user.following || 0}\n` +
          `❤️ Hearts: ${user.heartCount || user.hearts || 0}\n` +
          `🎬 Videos: ${user.videoCount || user.videos || 0}\n` +
          `🔗 Profile: https://tiktok.com/@${user.uniqueId || user.username}`;
        await sock.sendMessage(from, { text });
      } else {
        // Send the actual error from API
        let errMsg = data.error || data.message || 'User not found';
        await sock.sendMessage(from, { text: `❌ TikTok lookup failed: ${errMsg}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or invalid username.' });
    }
  }
};
