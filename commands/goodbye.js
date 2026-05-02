module.exports = {
  name: 'goodbye',
  category: 'group',
  description: 'Toggle goodbye messages on/off for this group (admin/owner only)',
  async execute(sock, msg, args, { isMe }) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

    const sender = msg.key.participant || msg.key.remoteJid;
    const groupMetadata = await sock.groupMetadata(from);
    const participant = groupMetadata.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    
    if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only group admins or bot owner can use this command.' });
    
    if (global.goodbyeEnabled[from] === undefined) global.goodbyeEnabled[from] = true;
    const newState = !global.goodbyeEnabled[from];
    global.goodbyeEnabled[from] = newState;
    await sock.sendMessage(from, { text: `✅ Goodbye messages are now *${newState ? "ON" : "OFF"}* for this group.` });
  }
};
