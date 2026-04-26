module.exports = {
    name: 'promote',
    category: 'group',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        if (!isArchitect && !isMe) return;
        const from = msg.key.remoteJid;
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     (args[0] && args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        if (!target) return sock.sendMessage(from, { text: '💡 Tag a user to promote.' });
        await sock.groupParticipantsUpdate(from, [target], "promote");
        await sock.sendMessage(from, { text: '⬆️ **SΛVΛGΞ-TECH:** User promoted to Admin.' });
    }
};
