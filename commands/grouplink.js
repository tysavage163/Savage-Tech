module.exports = {
    name: 'grouplink',
    category: 'group',
    description: 'Get group invite link and icon',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const group = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = group.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admins can use this.' });

        try {
            const inviteCode = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            let icon = null;
            try {
                const ppUrl = await sock.profilePictureUrl(from, 'image');
                icon = { url: ppUrl };
            } catch {}
            const caption = `🔗 *Group Link:*\n${inviteLink}\n\n*Group:* ${group.subject}\n*Valid for 72 hours.*`;
            if (icon) await sock.sendMessage(from, { image: icon, caption });
            else await sock.sendMessage(from, { text: caption });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ Failed to get link. Ensure I am admin and group allows links.' });
        }
    }
};
