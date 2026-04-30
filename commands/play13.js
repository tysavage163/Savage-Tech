const axios = require('axios');

module.exports = {
  name: 'play13',
  category: 'audio',
  description: 'Get song lyrics by name',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play13 song name' });

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `📜 *Savage-Tech is fetching lyrics for @${senderName}...*` });

    try {
      const url = `https://apis.xwolf.space/download/Lyrics?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data.success) {
        let lyrics = res.data.result || res.data.lyrics || 'Lyrics not found.';
        await sock.sendMessage(msg.key.remoteJid, { text: `📜 *Lyrics for "${query}":*\n${lyrics.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Lyrics not found'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lyrics API error.' });
    }
  }
};
