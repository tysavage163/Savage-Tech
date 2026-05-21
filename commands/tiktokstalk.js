const axios = require('axios');

module.exports = {
  name: 'tiktokstalk',
  category: 'search menu',
  description: 'Lookup TikTok user profile info with photo',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const username = args[0];
    if (!username) return sock.sendMessage(from, { text: '❌ Usage: .tiktokstalk <username>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/stalk/tiktok?username=${encodeURIComponent(username)}`);
      const data = res.data;

      if (data.success) {
        const user = {
          username: data.username,
          nickname: data.nickname || '-',
          bio: data.bio || '-',
          avatar: data.avatar,
          verified: data.verified,
          private: data.privateAccount,
          followers: data.followers?.toLocaleString() || '0',
          following: data.following?.toLocaleString() || '0',
          likes: data.likes?.toLocaleString() || '0',
          videos: data.videos?.toLocaleString() || '0',
          profileUrl: data.profileUrl || `https://tiktok.com/@${data.username}`
        };

        const caption = `🎵 *TIKTOK STALK* 🎵\n\n` +
          `👤 *User:* ${user.nickname}\n` +
          `📛 *Username:* @${user.username}\n` +
          `📝 *Bio:* ${user.bio.substring(0, 150)}${user.bio.length > 150 ? '...' : ''}\n` +
          `🔒 *Private:* ${user.private ? 'Yes' : 'No'}\n` +
          `✔️ *Verified:* ${user.verified ? 'Yes' : 'No'}\n\n` +
          `👥 *Followers:* ${user.followers}\n` +
          `👣 *Following:* ${user.following}\n` +
          `❤️ *Total Likes:* ${user.likes}\n` +
          `🎬 *Videos:* ${user.videos}\n\n` +
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
        await sock.sendMessage(from, { text: `❌ TikTok lookup failed: ${data.error || 'User not found'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or invalid username.' });
    }
  }
};
