const crypto = require('crypto');
module.exports = {
  name: 'hash',
  category: 'tools',
  description: 'Generate hash (md5, sha1, sha256)',
  async execute(sock, msg, args) {
    const input = args.join(' ');
    if (!input) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .hash <text> [algorithm] (md5/sha1/sha256)' });
    const parts = input.split(' ');
    const text = parts[0];
    let algo = parts[1] || 'md5';
    if (!['md5', 'sha1', 'sha256'].includes(algo)) algo = 'md5';
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    const hash = crypto.createHash(algo).update(text).digest('hex');
    await sock.sendMessage(msg.key.remoteJid, { text: `🔐 *${algo.toUpperCase()} hash for @${sender}*\n\n${hash}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
