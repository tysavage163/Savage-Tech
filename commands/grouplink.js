module.exports = {
    name: 'grouplink',
    category: 'group',
    description: 'Get the group invite link and icon (Admin only)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const group = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = group.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only group admins can use this.' });

        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        const botParticipant = group.participants.find(p => p.id.includes(botNumber));
        if (!botParticipant || (botParticipant.admin !== 'admin' && botParticipant.admin !== 'superadmin')) {
            return sock.sendMessage(from, { text: '❌ Make me admin first.' });
        }

        try {
            const inviteCode = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            
            // Fetch group icon
            let icon = null;
            try {
                const ppUrl = await sock.profilePictureUrl(from, 'image');
                icon = { url: ppUrl };
            } catch {
                // No group icon set – ignore
            }

            const caption = `🔗 *Group Invite Link:*\n${inviteLink}\n\n_Valid for 72 hours._\n\n👥 *Group:* ${group.subject}\n👑 *Owner:* ${group.owner || 'Unknown'}`;

            if (icon) {
                await sock.sendMessage(from, { image: icon, caption: caption });
            } else {
                await sock.sendMessage(from, { text: caption });
            }
        } catch (error) {
            console.error('Error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to generate group link. Make sure I have admin and group allows links.' });
        }
    }
};
