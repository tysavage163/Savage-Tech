module.exports = {
  name: 'listactive',
  category: 'group',
  description: 'Rank group members by messages sent',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });
    try {
      const meta = await sock.groupMetadata(from);
      const participants = meta.participants.map(p => p.id);
      const counts = global.messageCounts[from] || {};
      const sorted = participants
        .map(jid => ({ jid, count: counts[jid] || 0 }))
        .sort((a, b) => b.count - a.count);
      const lines = sorted.map((user, idx) =>
        `${idx+1}. @${user.jid.split('@')[0]} — ${user.count} msgs`
      ).join('\n');
      const text = `📊 *Activity Ranking in ${meta.subject}*\n👥 Total: ${participants.length}\n\n${lines}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
      await sock.sendMessage(from, { text: text, mentions: participants });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
    }
  }
};
