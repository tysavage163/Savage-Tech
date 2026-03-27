module.exports = {
    name: 'kick',
    description: 'Remove a user from the group',
    async execute(sock, m, args) {
        if (!m.key.remoteJid.endsWith('@g.us')) return sock.sendMessage(m.key.remoteJid, { text: '❌ This is for groups only!' });
        
        const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0] || m.message.extendedTextMessage?.contextInfo?.participant;
        
        if (!user) return sock.sendMessage(m.key.remoteJid, { text: '⚠️ Tag the person you want to kick!' });

        try {
            await sock.groupParticipantsUpdate(m.key.remoteJid, [user], "remove");
            await sock.sendMessage(m.key.remoteJid, { text: '🚀 Savage Tech: Target Eliminated.' });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Error: I need Admin profile to do that!' });
        }
    }
};
