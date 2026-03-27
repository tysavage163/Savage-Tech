module.exports = {
    name: 'promote',
    description: 'Promote a member to admin',
    async execute(sock, m) {
        // Check if the bot is admin first
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = participants.find(p => p.id === botId)?.admin;

        if (!isBotAdmin) return sock.sendMessage(m.key.remoteJid, { text: '❌ I need Admin powers to promote others!' });

        // Get the person to promote (tagged or replied to)
        const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     m.message.extendedTextMessage?.contextInfo?.participant;

        if (!user) return sock.sendMessage(m.key.remoteJid, { text: 'Tag the person you want to promote, Beck.' });

        // Execute promotion
        await sock.groupParticipantsUpdate(m.key.remoteJid, [user], "promote");
        await sock.sendMessage(m.key.remoteJid, { text: 'User has been promoted to Admin. 👑' });
    }
};
