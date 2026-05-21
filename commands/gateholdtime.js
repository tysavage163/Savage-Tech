module.exports = {
    name: 'gateholdtime',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' }, { quoted: msg });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gateholdtime <minutes> or off' }, { quoted: msg });
        let minutes = args[0].toLowerCase();
        if (minutes === 'off') {
            if (!global.gateConfig) global.gateConfig = {};
            if (!global.gateConfig[from]) global.gateConfig[from] = {};
            global.gateConfig[from].holdTime = null;
            return sock.sendMessage(from, { text: '✅ Hold time disabled (no mute).' }, { quoted: msg });
        }
        minutes = parseInt(minutes);
        if (isNaN(minutes) || minutes < 1) return sock.sendMessage(from, { text: '❌ Enter a valid number (minutes).' }, { quoted: msg });
        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].holdTime = minutes * 60 * 1000;
        await sock.sendMessage(from, { text: `✅ Mute duration set to ${minutes} minute(s).` }, { quoted: msg });
    }
};
