const axios = require('axios');

module.exports = {
  name: 'instagramstalk',
  category: 'search menu',
  description: 'Lookup Instagram user profile info',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const username = args[0];
    if (!username) return sock.sendMessage(from, { text: '❌ Usage: .instagramstalk <username>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/stalk/instagram?username=${encodeURIComponent(username)}`);
      const data = res.data;
      if (data.success) {
        const user = data.result;
        const text = `📸 *Instagram Stalk*\n\n📛 Username: ${user.username}\n👤 Name: ${user.fullName}\n📝 Bio: ${user.bio || '-'}\n🔒 Private: ${user.isPrivate ? 'Yes' : 'No'}\n✔️ Verified: ${user.isVerified ? 'Yes' : 'No'}\n👥 Followers: ${user.followerCount}\n👣 Following: ${user.followingCount}\n📷 Posts: ${user.mediaCount}\n🔗 Profile: https://instagram.com/${user.username}`;
        await sock.sendMessage(from, { text });
      } else {
        await sock.sendMessage(from, { text: `❌ Instagram lookup failed: ${data.error || 'User not found'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or invalid username.' });
    }
  }
};
