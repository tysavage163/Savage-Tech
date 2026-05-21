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
      const data = res.data;
      if (data.success) {
        const user = data.result;
        const text = `🎵 *TikTok Stalk*\n\n📛 Username: ${user.uniqueId}\n👤 Name: ${user.nickname}\n✔️ Verified: ${user.verified ? 'Yes' : 'No'}\n👥 Followers: ${user.followerCount}\n👣 Following: ${user.followingCount}\n❤️ Hearts: ${user.heartCount}\n🎬 Videos: ${user.videoCount}\n🔗 Profile: https://tiktok.com/@${user.uniqueId}`;
        await sock.sendMessage(from, { text });
      } else {
        await sock.sendMessage(from, { text: `❌ TikTok lookup failed: ${data.error || 'User not found'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or invalid username.' });
    }
  }
};
