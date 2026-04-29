module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve all pending join requests (Admin only)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const group = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = group.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admins can use this.' });

        // Get bot's phone number (without suffix or @)
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        const botParticipant = group.participants.find(p => p.id.includes(botNumber));
        if (!botParticipant) return sock.sendMessage(from, { text: '❌ Bot not found in group. Re-add me.' });
        if (!(botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')) {
            return sock.sendMessage(from, { text: '❌ Make me admin first.' });
        }

        const pending = group.participants.filter(p => p.isPending === true);
        if (!pending.length) return sock.sendMessage(from, { text: '✅ No pending requests.' });

        await sock.groupParticipantsUpdate(from, pending.map(p => p.id), 'approve');
        await sock.sendMessage(from, { text: `✅ Approved ${pending.length} request(s).` });
    }
};
