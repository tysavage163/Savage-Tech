const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'npm',
  category: 'search menu',
  description: 'Search NPM packages',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .npm <package>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching NPM for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`, { httpsAgent: agent });
      if (!res.data.objects.length) throw new Error('No packages found');
      let text = `📦 *NPM SEARCH: ${query}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      res.data.objects.forEach((pkg, i) => {
        const p = pkg.package;
        text += `${i+1}. *${p.name}*\n   📌 v${p.version}\n   📝 ${(p.description || 'No description').slice(0, 150)}\n   🔗 ${p.links.npm}\n\n`;
      });
      await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ NPM error: ${err.message}` });
    }
  }
};
