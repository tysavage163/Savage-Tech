const axios = require('axios');

module.exports = {
  name: 'playlyrics',
  category: 'audio',
  description: 'Get song lyrics by name',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .playlyrics song name' });

    const senderName = msg.pushName || 'User';
    try {
      const url = `https://apis.xwolf.space/download/Lyrics?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data.success) {
        let lyrics = res.data.result || res.data.lyrics || 'Lyrics not found.';
        const text = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n📜 *SΛVΛGΞ-TECH fetched lyrics for @${senderName} – "${query}"*\n\n${lyrics.slice(0, 1500)}\n\nInspired by Meryl`;
        await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000) });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ ${res.data.error || 'Lyrics not found'}\n\nInspired by Meryl` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ Lyrics API error.\n\nInspired by Meryl` });
    }
  }
};
