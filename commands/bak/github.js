const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'github',
  category: 'search menu',
  description: 'Search GitHub repositories',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .github <query>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching GitHub for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, { httpsAgent: agent, headers: { 'User-Agent': 'Savage-Tech-Bot' } });
      if (!res.data.items.length) throw new Error('No repositories found');
      let text = `🐙 *GITHUB SEARCH: ${query}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      res.data.items.forEach((repo, i) => {
        text += `${i+1}. *${repo.full_name}*\n   ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}\n   📝 ${(repo.description || 'No description').slice(0, 150)}\n   🔗 ${repo.html_url}\n\n`;
      });
      await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ GitHub error: ${err.message}` });
    }
  }
};
