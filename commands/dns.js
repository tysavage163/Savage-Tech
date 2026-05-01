const dns = require('dns').promises;
module.exports = {
  name: 'dns',
  category: 'ethical hacking',
  description: 'DNS lookup (A, AAAA, MX, TXT, NS, CNAME)',
  async execute(sock, msg, args) {
    const domain = args[0];
    if (!domain) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .dns <domain>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Performing DNS lookup on ${domain}...`, mentions: [jid] });
      const records = {};
      const types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];
      for (const type of types) {
        try { records[type] = await dns.resolve(domain, type); } catch { records[type] = 'Not found'; }
      }
      let result = `🌐 DNS Records for ${domain}\n`;
      result += `A: ${Array.isArray(records.A) ? records.A.join(', ') : records.A}\n`;
      result += `AAAA: ${Array.isArray(records.AAAA) ? records.AAAA.join(', ') : records.AAAA}\n`;
      result += `MX: ${Array.isArray(records.MX) ? records.MX.map(r => `${r.exchange} (prio ${r.priority})`).join(', ') : records.MX}\n`;
      result += `TXT: ${Array.isArray(records.TXT) ? records.TXT.flat().join(', ').slice(0, 200) : records.TXT}\n`;
      result += `NS: ${Array.isArray(records.NS) ? records.NS.join(', ') : records.NS}\n`;
      result += `CNAME: ${Array.isArray(records.CNAME) ? records.CNAME.join(', ') : records.CNAME}\n`;
      const output = `🛡️ *DNS Lookup*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${domain}\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ DNS error: ${err.message}` });
    }
  }
};
