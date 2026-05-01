const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'pypi',
  category: 'search menu',
  description: 'PyPI package info',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .pypi <package>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching PyPI for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(query)}/json`, { httpsAgent: agent });
      const info = res.data.info;
      const summary = (info.summary || 'No summary').slice(0, 500);
      const result = `🐍 *PYPI: ${info.name}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n📦 Version: ${info.version}\n📝 Summary: ${summary}\n🔗 ${info.package_url || `https://pypi.org/project/${info.name}`}`;
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      if (err.response?.status === 404) await sock.sendMessage(msg.key.remoteJid, { text: `❌ Package "${query}" not found.` });
      else await sock.sendMessage(msg.key.remoteJid, { text: `❌ PyPI error: ${err.message}` });
    }
  }
};
