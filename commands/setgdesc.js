module.exports = {
    name: 'setgdesc',
    async execute(sock, m, args) {
        if (!m.key.remoteJid.endsWith('@g.us')) return;
        const newDesc = args.join(' ');
        
        if (!newDesc) return sock.sendMessage(m.key.remoteJid, { text: '❌ What is the new description?' });

        try {
            await sock.groupUpdateDescription(m.key.remoteJid, newDesc);
            await sock.sendMessage(m.key.remoteJid, { text: `✅ *GROUP DESCRIPTION UPDATED:* \n\n"${newDesc}"` });
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Error: Make sure I am an Admin!' });
        }
    }
};
