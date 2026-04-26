module.exports = {
    name: 'tagall',
    category: 'group',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        if (!isArchitect && !isMe) return;
        const from = msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        let message = args.join(' ') || '📢 *SΛVΛGΞ-TECH: ATTENTION REQUIRED*';
        message += '\n\n';
        for (let mem of participants) {
            message += `┃ ➥ @${mem.id.split('@')[0]}\n`;
        }
        await sock.sendMessage(from, { text: message, mentions: participants.map(a => a.id) }, { quoted: msg });
    }
};
