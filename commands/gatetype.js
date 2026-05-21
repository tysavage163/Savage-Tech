module.exports = {
    name: 'gatetype',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Admin only.' }, { quoted: msg });

        if (!args[0]) return sock.sendMessage(from, { text: 'Usage: .gatetype button / math / text / text2' }, { quoted: msg });
        const type = args[0].toLowerCase();
        const valid = ['button', 'math', 'text', 'text2'];
        if (!valid.includes(type)) return sock.sendMessage(from, { text: '❌ Invalid type. Choose: button, math, text, text2' }, { quoted: msg });

        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].type = type;
        await sock.sendMessage(from, { text: `✅ CAPTCHA type set to: ${type}` }, { quoted: msg });
    }
};
