module.exports = {
  name: 'textstats',
  category: 'tools',
  description: 'Analyze text statistics',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .textstats <text>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w).length;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const result = `Characters: ${chars}\nWords: ${words}\nLines: ${lines}\nSentences: ${sentences}`;
    await sock.sendMessage(msg.key.remoteJid, { text: `📊 *Text Statistics for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
