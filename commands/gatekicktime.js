module.exports = {
    name: 'gatekicktime',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gatekicktime <minutes>' });
        const minutes = parseInt(args[0]);
        if (isNaN(minutes) || minutes < 1) return sock.sendMessage(from, { text: '❌ Enter a valid number (minutes).' });
        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].kickTime = minutes * 60 * 1000;
        await sock.sendMessage(from, { text: `✅ Users will be kicked after ${minutes} minute(s) if not verified.` });
    }
};
