module.exports = {
    name: 'gaterules',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gaterules on/off' });
        const state = args[0].toLowerCase();
        if (state !== 'on' && state !== 'off') return sock.sendMessage(from, { text: '❌ on or off.' });

        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].requireRules = (state === 'on');
        await sock.sendMessage(from, { text: `✅ Rules acceptance requirement: ${state.toUpperCase()}` });
    }
};
