const axios = require('axios');

module.exports = {
  name: 'translate',
  category: 'tools',
  description: 'Translate text to any language (Google Translate)',
  async execute(sock, msg, args) {
    let full = args.join(' ');
    if (!full) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .translate <text> [to:lang]' });

    let target = 'en';
    let text = full;
    const toMatch = full.match(/\s+(to|--to)\s+([a-z]{2})$/i);
    if (toMatch) {
      target = toMatch[2];
      text = full.substring(0, toMatch.index).trim();
    } else {
      const words = full.split(' ');
      const last = words[words.length - 1];
      if (last.length === 2 && /^[a-z]{2}$/i.test(last)) {
        target = last.toLowerCase();
        words.pop();
        text = words.join(' ');
      }
    }

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔄 Translating to ${target.toUpperCase()}...`, mentions: [jid] });
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await axios.get(url);
      let translated = '';
      for (const part of res.data[0]) {
        if (part[0]) translated += part[0];
      }
      const detectedLang = res.data[2] || 'auto';
      const caption = `🌐 *Translation (${detectedLang} → ${target})*\n👤 REQUESTED BY: @${sender}\n\n📝 **Original:**\n${text}\n\n✅ **Translated:**\n${translated}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
      await sock.sendMessage(msg.key.remoteJid, { text: caption.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      console.error('Translate error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Translation failed: ${err.message}` });
    }
  }
};
