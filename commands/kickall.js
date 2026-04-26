module.exports = {
    name: 'kickall',
    category: 'group',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        if (!isArchitect && !isMe) return;
        const from = msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        await sock.sendMessage(from, { text: '☣️ **SΛVΛGΞ-TECH:** Initiating Mass Purge...' });

        for (let mem of participants) {
            if (mem.id !== myNumber && !mem.admin) {
                await sock.groupParticipantsUpdate(from, [mem.id], "remove");
            }
        }
        await sock.sendMessage(from, { text: '✅ **PURGE COMPLETE.**' });
    }
};
