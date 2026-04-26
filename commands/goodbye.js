module.exports = {
    category: 'group',
    name: 'goodbye',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command is for Groups only.' }, { quoted: msg });
        }

        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            global.goodbyeStore.add(from);
            return sock.sendMessage(from, { text: "✅ *SΛVΛGΞ Goodbye System: ACTIVATED*" }, { quoted: msg });
        } else if (status === 'off') {
            global.goodbyeStore.delete(from);
            return sock.sendMessage(from, { text: "❌ *SΛVΛGΞ Goodbye System: DEACTIVATED*" }, { quoted: msg });
        } else {
            return sock.sendMessage(from, { text: "💡 *Usage:* .goodbye on/off" }, { quoted: msg });
        }
    }
};
