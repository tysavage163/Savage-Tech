module.exports = {
    name: 'groupinfo',
    category: 'group',
    description: 'Show group details including icon',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const group = await sock.groupMetadata(from);
        const owner = group.owner || 'Unknown';
        const created = new Date(group.creation * 1000).toLocaleString();
        const members = group.participants.length;
        const admins = group.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
        const description = group.desc || 'None';

        // Try to fetch group icon
        let icon = null;
        try {
            const iconUrl = await sock.profilePictureUrl(from, 'image');
            icon = { url: iconUrl };
        } catch (err) {
            // No icon set – ignore
        }

        const caption = `📛 *Group:* ${group.subject}\n🆔 *ID:* ${from}\n👑 *Owner:* ${owner}\n📅 *Created:* ${created}\n👥 *Members:* ${members}\n🔨 *Admins:* ${admins}\n📝 *Description:* ${description}`;

        if (icon) {
            await sock.sendMessage(from, { image: icon, caption });
        } else {
            await sock.sendMessage(from, { text: caption });
        }
    }
};
