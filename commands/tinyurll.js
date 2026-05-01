const axios = require('axios');

module.exports = {
  name: 'tinyurll',
  category: 'tools',
  description: 'Shorten URL with TinyURL (official API)',
  async execute(sock, msg, args) {
    const longUrl = args[0];
    if (!longUrl || !longUrl.startsWith('http')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .tinyurll <url>' });
    }

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      const short = res.data;
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🔗 *TinyURL for @${senderName}*\n\n${short}\n\n🚀 POWERED BY SAVAGE-CORE`,
        mentions: mention,
      });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
    }
  },
};
