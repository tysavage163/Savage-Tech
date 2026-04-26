module.exports = {
    name: 'unblock',
    category: 'admin',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        if (!isArchitect && !isMe) return;
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     (args[0] && args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        if (!target) return sock.sendMessage(msg.key.remoteJid, { text: '💡 Tag someone to whitelist.' });
        global.blacklist.delete(target);
        await sock.sendMessage(msg.key.remoteJid, { text: '✅ **ACCESS RESTORED.**' });
    }
};
