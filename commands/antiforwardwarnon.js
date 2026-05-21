module.exports = {
    name: 'antiforwardwarnon',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' }, { quoted: msg });

        let warnLimit = 3;
        if (args[0] && !isNaN(parseInt(args[0]))) warnLimit = parseInt(args[0]);
        if (!global.antiForwardConfig) global.antiForwardConfig = {};
        global.antiForwardConfig[from] = { enabled: true, action: 'warn', warnLimit: warnLimit };
        await sock.sendMessage(from, { text: `✅ Anti‑forward enabled: forwarded messages will be **deleted** and the sender will be warned. Warn limit: ${warnLimit}.` }, { quoted: msg });
    }
};
