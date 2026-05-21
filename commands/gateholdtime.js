module.exports = {
    name: 'gateholdtime',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gateholdtime <minutes> or off' });
        let minutes = args[0].toLowerCase();
        if (minutes === 'off') {
            if (!global.gateConfig) global.gateConfig = {};
            if (!global.gateConfig[from]) global.gateConfig[from] = {};
            global.gateConfig[from].holdTime = null;
            return sock.sendMessage(from, { text: '✅ Hold time disabled (no mute).' });
        }
        minutes = parseInt(minutes);
        if (isNaN(minutes) || minutes < 1) return sock.sendMessage(from, { text: '❌ Enter a valid number (minutes).' });
        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].holdTime = minutes * 60 * 1000; // store in ms
        await sock.sendMessage(from, { text: `✅ Mute duration set to ${minutes} minute(s).` });
    }
};
