module.exports = {
    name: 'debuggroup',
    category: 'owner',
    description: 'Debug group participants and bot admin status',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Use in a group.' });

        const group = await sock.groupMetadata(from);
        const botFull = sock.user.id;  // e.g., "254765956776:71@s.whatsapp.net"
        const botNoSuffix = botFull.split(':')[0] + '@s.whatsapp.net';

        let found = null;
        const participantsList = [];
        for (const p of group.participants) {
            participantsList.push(`${p.id} → admin: ${p.admin || 'none'}`);
            if (p.id === botFull || p.id === botNoSuffix) {
                found = p;
            }
        }

        const status = found ? (found.admin === 'admin' || found.admin === 'superadmin' ? '✅ Bot is admin' : '❌ Bot is not admin') : '❌ Bot not found in participants';

        let message = `🤖 *Bot ID:* ${botFull}\n📱 *Bot ID (no suffix):* ${botNoSuffix}\n${status}\n\n👥 *Participants (first 20):*\n${participantsList.slice(0, 20).join('\n')}`;
        if (participantsList.length > 20) message += `\n... and ${participantsList.length - 20} more.`;

        await sock.sendMessage(from, { text: message });
    }
};
