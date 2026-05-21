module.exports = {
    name: 'antiforwardkickon',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' });

        if (!global.antiForwardConfig) global.antiForwardConfig = {};
        global.antiForwardConfig[from] = { enabled: true, action: 'kick', warnLimit: 0 };
        await sock.sendMessage(from, { text: '✅ Anti‑forward enabled: forwarded messages will be **deleted** and the sender will be **kicked immediately**.' });
    }
};
