module.exports = {
    name: 'antiforwardoff',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' });

        if (!global.antiForwardConfig) global.antiForwardConfig = {};
        global.antiForwardConfig[from] = { enabled: false };
        await sock.sendMessage(from, { text: '❌ Anti‑forward disabled.' });
    }
};
