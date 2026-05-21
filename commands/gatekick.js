module.exports = {
    name: 'gatekick',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' }, { quoted: msg });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gatekick on/off' }, { quoted: msg });
        const state = args[0].toLowerCase();
        if (state !== 'on' && state !== 'off') return sock.sendMessage(from, { text: '❌ on or off.' }, { quoted: msg });

        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].kickEnabled = (state === 'on');
        await sock.sendMessage(from, { text: `✅ Kick unverified users: ${state.toUpperCase()}` }, { quoted: msg });
    }
};
