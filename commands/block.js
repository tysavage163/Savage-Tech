module.exports = {
    name: 'block',
    category: 'admin',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        if (!isArchitect && !isMe) return;
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     (args[0] && args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        if (!target) return sock.sendMessage(msg.key.remoteJid, { text: '💡 Tag someone to blacklist.' });
        global.blacklist.add(target);
        await sock.sendMessage(msg.key.remoteJid, { text: '🚫 **ACCESS REVOKED.**' });
    }
};
