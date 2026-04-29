module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve pending join requests (Admin only)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const group = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = group.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only group admins can use this.' });

        const botJidFull = sock.user.id; // e.g., "1234567890:0@s.whatsapp.net"
        const botJidNoDevice = botJidFull.split(':')[0] + '@s.whatsapp.net';
        
        // Find bot in participants
        let botParticipant = group.participants.find(p => p.id === botJidFull || p.id === botJidNoDevice);
        
        // Debug: send info to the user
        await sock.sendMessage(from, { text: `🔍 *Debug Info*\nBot IDs:\n• ${botJidFull}\n• ${botJidNoDevice}\n\nBot found in group: ${botParticipant ? '✅ yes' : '❌ no'}\nBot admin: ${botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin') ? '✅ yes' : '❌ no'}` });
        
        const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
        if (!isBotAdmin) return sock.sendMessage(from, { text: '❌ Make me admin first.' });

        const pending = group.participants.filter(p => p.isPending === true);
        if (!pending.length) return sock.sendMessage(from, { text: '✅ No pending requests.' });

        await sock.groupParticipantsUpdate(from, pending.map(p => p.id), 'approve');
        await sock.sendMessage(from, { text: `✅ Approved ${pending.length} request(s).` });
    }
};
