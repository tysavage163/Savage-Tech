module.exports = {
    name: 'hidetag',
    async execute(sock, m, args) {
        if (!m.key.remoteJid.endsWith('@g.us')) return;

        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;
        const text = args.join(' ') || '📢 Attention everyone!';

        await sock.sendMessage(m.key.remoteJid, { 
            text: text, 
            mentions: participants.map(a => a.id) 
        });
    }
};
