module.exports = {
  name: 'urlencode',
  category: 'tools',
  description: 'URL encode a string',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .urlencode <text>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    const encoded = encodeURIComponent(text);
    await sock.sendMessage(msg.key.remoteJid, { text: `🔗 *URL Encoded for @${sender}*\n\n${encoded}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
