const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'urban',
  category: 'search menu',
  description: 'Urban Dictionary – definition & example',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .urban <word>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching Urban Dictionary for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`, { httpsAgent: agent });
      if (!res.data.list.length) throw new Error('No definitions');
      const def = res.data.list[0];
      const definition = def.definition.slice(0, 800);
      const example = def.example.slice(0, 300);
      const result = `📖 *URBAN: ${def.word}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n📝 Definition:\n${definition}\n\n📌 Example:\n${example}\n\n👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}\n🔗 ${def.permalink}`;
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Urban error: ${err.message}` });
    }
  }
};
