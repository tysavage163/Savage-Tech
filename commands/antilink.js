module.exports = {
  name: 'antilink',
  category: 'group',
  description: 'Toggle WhatsApp group link protection (admin/owner only)',
  async execute(sock, msg, args, { isMe }) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });
    const sender = msg.key.participant || msg.key.remoteJid;
    const groupMetadata = await sock.groupMetadata(from);
    const participant = groupMetadata.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only admins or bot owner can use this.' });
    if (global.antiLink === undefined) global.antiLink = {};
    if (global.antiLink[from] === undefined) global.antiLink[from] = false;
    const newState = !global.antiLink[from];
    global.antiLink[from] = newState;
    await sock.sendMessage(from, { text: `✅ Group link protection is now *${newState ? "ON" : "OFF"}* for this group.\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼` });
  }
};
