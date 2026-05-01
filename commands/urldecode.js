module.exports = {
  name: 'urldecode',
  category: 'tools',
  description: 'URL decode a string',
  async execute(sock, msg, args) {
    const encoded = args.join(' ');
    if (!encoded) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .urldecode <encoded_string>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const decoded = decodeURIComponent(encoded);
      await sock.sendMessage(msg.key.remoteJid, { text: `🔓 *URL Decoded for @${sender}*\n\n${decoded}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Invalid URL encoded string` }); }
  }
};
