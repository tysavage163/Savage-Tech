module.exports = {
    name: 'link',
    async execute(sock, m) {
        if (!m.key.remoteJid.endsWith('@g.us')) return;
        const code = await sock.groupInviteCode(m.key.remoteJid);
        await sock.sendMessage(m.key.remoteJid, { text: `https://chat.whatsapp.com/${code}` });
    }
};
