module.exports = {
    name: 'kick',
    description: 'Remove a member from the group',
    async execute(sock, m) {
        // Get the group info
        const metadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = metadata.participants;
        
        // Check if the Bot is an Admin
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botAdmin = participants.find(p => p.id === botId)?.admin;
        if (!botAdmin) return sock.sendMessage(m.key.remoteJid, { text: '❌ I need Admin powers to kick people!' });

        // Get the person to kick (either by tagging them or replying to their message)
        const victim = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       m.message.extendedTextMessage?.contextInfo?.participant;

        if (!victim) return sock.sendMessage(m.key.remoteJid, { text: 'Tag the person you want to remove, Beck.' });

        // The "Savage" Kick
        await sock.groupParticipantsUpdate(m.key.remoteJid, [victim], "remove");
        await sock.sendMessage(m.key.remoteJid, { text: 'Target eliminated. 🚮' });
    }
};
