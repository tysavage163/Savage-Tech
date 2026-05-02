module.exports = {
  name: 'antistatusmention',
  category: 'group',
  description: 'Toggle @group mention protection (admin/owner only)',
  async execute(sock, msg, args, { isMe }) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });
    const sender = msg.key.participant || msg.key.remoteJid;
    const groupMetadata = await sock.groupMetadata(from);
    const participant = groupMetadata.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only admins or bot owner can use this.' });
    if (global.antiStatusMention === undefined) global.antiStatusMention = {};
    if (global.antiStatusMention[from] === undefined) global.antiStatusMention[from] = false;
    const newState = !global.antiStatusMention[from];
    global.antiStatusMention[from] = newState;
    await sock.sendMessage(from, { text: `✅ @group mention protection is now *${newState ? "ON" : "OFF"}* for this group.\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼` });
  }
};
