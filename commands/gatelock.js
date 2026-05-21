module.exports = {
    name: 'gateLock',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ This command is for groups only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin permission required.' }, { quoted: msg });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gateLock on/off' }, { quoted: msg });
        const state = args[0].toLowerCase();
        if (state !== 'on' && state !== 'off') return sock.sendMessage(from, { text: '❌ Please specify on or off.' }, { quoted: msg });

        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].enabled = (state === 'on');
        await sock.sendMessage(from, { text: `✅ Gate system turned ${state.toUpperCase()}.` }, { quoted: msg });
    }
};
