const axios = require('axios');

module.exports = {
  name: 'twitterstalk',
  category: 'search menu',
  description: 'Lookup Twitter/X user profile info with photo',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const username = args[0];
    if (!username) return sock.sendMessage(from, { text: '❌ Usage: .twitterstalk <username>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/stalk/twitter?username=${encodeURIComponent(username)}`);
      const data = res.data;

      if (data.success) {
        const user = {
          username: data.result?.screenName || data.username,
          name: data.result?.name || data.name,
          bio: data.result?.description || data.bio || '-',
          avatar: data.result?.profileImageUrlHttps || data.avatar,
          verified: data.result?.verified || data.verified,
          followers: (data.result?.followersCount || data.followers || 0).toLocaleString(),
          following: (data.result?.friendsCount || data.following || 0).toLocaleString(),
          tweets: (data.result?.statusesCount || data.tweets || 0).toLocaleString(),
          joined: data.result?.createdAt ? data.result.createdAt.split('T')[0] : (data.joined || '-'),
          profileUrl: `https://twitter.com/${username}`
        };

        const caption = `🐦 *TWITTER STALK* 🐦\n\n` +
          `👤 *Name:* ${user.name}\n` +
          `📛 *Username:* @${user.username}\n` +
          `📝 *Bio:* ${user.bio.substring(0, 150)}${user.bio.length > 150 ? '...' : ''}\n` +
          `✔️ *Verified:* ${user.verified ? 'Yes' : 'No'}\n\n` +
          `👥 *Followers:* ${user.followers}\n` +
          `👣 *Following:* ${user.following}\n` +
          `🐦 *Tweets:* ${user.tweets}\n` +
          `📅 *Joined:* ${user.joined}\n\n` +
          `🔗 *Profile:* ${user.profileUrl}`;

        let imageBuffer = null;
        if (user.avatar) {
          try {
            const imgRes = await axios.get(user.avatar, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(imgRes.data);
          } catch (imgErr) {
            console.log('Avatar download failed:', imgErr.message);
          }
        }

        if (imageBuffer) {
          await sock.sendMessage(from, {
            image: imageBuffer,
            caption: caption,
            mentions: []
          }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: caption }, { quoted: msg });
        }
      } else {
        await sock.sendMessage(from, { text: `❌ Twitter lookup failed: ${data.error || 'User not found'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or invalid username.' });
    }
  }
};
