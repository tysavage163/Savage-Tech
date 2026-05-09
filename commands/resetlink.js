module.exports = {
    name: 'resetlink',
    category: 'group',
    description: 'Reset the group invite link (admin/owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (err) {
            console.error('Error checking admin:', err);
        }
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only group admins or bot owner can reset the link.' });

        try {
            const newInviteCode = await sock.groupRevokeInvite(from);
            const newLink = `https://chat.whatsapp.com/${newInviteCode}`;
            const text = `✅ Group invite link has been reset.\n🔗 New link: ${newLink}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
            await sock.sendMessage(from, { text: text });
        } catch (err) {
            console.error('Reset link error:', err);
            await sock.sendMessage(from, { text: `❌ Failed to reset invite link: ${err.message}` });
        }
    }
};
