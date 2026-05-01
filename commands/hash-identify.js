const crypto = require('crypto');
const hashPatterns = [
  { regex: /^[a-f0-9]{32}$/i, name: 'MD5' },
  { regex: /^[a-f0-9]{40}$/i, name: 'SHA-1' },
  { regex: /^[a-f0-9]{64}$/i, name: 'SHA-256' },
  { regex: /^[a-f0-9]{128}$/i, name: 'SHA-512' },
  { regex: /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/, name: 'bcrypt' },
  { regex: /^[0-9a-f]{16}$/i, name: 'MySQL / NTLM' },
];
module.exports = {
  name: 'hash-identify',
  category: 'ethical hacking',
  description: 'Identify hash type (MD5, SHA1, SHA256, etc.)',
  async execute(sock, msg, args) {
    const hash = args[0];
    if (!hash) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .hash-identify <hash>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    let matches = [];
    for (const pattern of hashPatterns) {
      if (pattern.regex.test(hash)) matches.push(pattern.name);
    }
    let result = matches.length ? `Possible hash types: ${matches.join(', ')}` : 'Unknown hash type (or too short)';
    const output = `🛡️ *Hash Identification*\n👤 REQUESTED BY: @${sender}\n📝 Input: ${hash.slice(0, 50)}\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`;
    await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
  }
};
