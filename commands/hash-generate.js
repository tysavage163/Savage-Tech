const crypto = require('crypto');
module.exports = {
  name: 'hash-generate',
  category: 'ethical hacking',
  description: 'Generate MD5, SHA1, SHA256, SHA512 hash',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .hash-generate <text>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    const md5 = crypto.createHash('md5').update(text).digest('hex');
    const sha1 = crypto.createHash('sha1').update(text).digest('hex');
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    const sha512 = crypto.createHash('sha512').update(text).digest('hex');
    let result = `🔐 Hashes for "${text}":\nMD5: ${md5}\nSHA1: ${sha1}\nSHA256: ${sha256}\nSHA512: ${sha512}`;
    const output = `🛡️ *Hash Generator*\n👤 REQUESTED BY: @${sender}\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`;
    await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
  }
};
