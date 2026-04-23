module.exports = {
    name: 'hidetag',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        await sock.sendMessage(from, { 
            text: args.join(' ') || '📢 Attention!', 
            mentions: participants.map(a => a.id) 
        });
    }
};
