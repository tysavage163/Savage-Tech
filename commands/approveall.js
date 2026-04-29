module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve all pending join requests (Admin only)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        // Force fresh metadata (bypass cache)
        const group = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = group.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only group admins can use this.' });

        // Get bot's phone number (without suffix or @)
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        
        // Find bot in participants by matching phone number (relaxed comparison)
        const botParticipant = group.participants.find(p => p.id.includes(botNumber));
        
        if (!botParticipant) {
            return sock.sendMessage(from, { text: '❌ Could not find bot in group. Try removing and re-adding me as admin.' });
        }
        
        const isBotAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
        if (!isBotAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first.' });

        const pending = group.participants.filter(p => p.isPending === true);
        if (!pending.length) return sock.sendMessage(from, { text: '✅ No pending requests.' });

        await sock.groupParticipantsUpdate(from, pending.map(p => p.id), 'approve');
        await sock.sendMessage(from, { text: `✅ Approved ${pending.length} request(s).` });
    }
};
