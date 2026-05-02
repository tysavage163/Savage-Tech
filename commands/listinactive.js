module.exports = {
  name: 'listinactive',
  category: 'group',
  description: 'Tag members inactive for 24h',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });
    try {
      const meta = await sock.groupMetadata(from);
      const participants = meta.participants.map(p => p.id);
      const timestamps = global.lastMessageTime[from] || {};
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const inactive = participants.filter(jid => {
        const last = timestamps[jid];
        return !last || (now - last) > oneDay;
      });
      if (inactive.length === 0) {
        return sock.sendMessage(from, { text: `✅ No inactive members in the last 24h.` });
      }
      const list = inactive.map(jid => `⏳ @${jid.split('@')[0]}`).join('\n');
      const text = `🕒 *Inactive Members (24h)*\n👥 Total: ${inactive.length}\n\n${list}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
      await sock.sendMessage(from, { text: text, mentions: inactive });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` });
    }
  }
};
