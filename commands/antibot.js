module.exports = {
    name: 'antibot',
    category: 'group',
    description: 'Toggle anti‑bot mode (kicks new members automatically)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0];
            const participant = meta.participants.find(p => p.id.split('@')[0] === senderNumber);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {
            return sock.sendMessage(from, { text: '❌ Failed to verify admin status.' }, { quoted: msg });
        }
        if (!isAdmin) {
            return sock.sendMessage(from, { text: '🔒 Only group admins can manage antibot.' }, { quoted: msg });
        }

        if (!args[0]) {
            const status = global.antiBot?.[from] ? 'enabled' : 'disabled';
            return sock.sendMessage(from, { text: `🛡️ Anti‑bot is currently ${status}. Use .antibot on/off to change.` }, { quoted: msg });
        }

        const option = args[0].toLowerCase();
        if (option !== 'on' && option !== 'off') {
            return sock.sendMessage(from, { text: '❌ Usage: .antibot on / off' }, { quoted: msg });
        }

        if (!global.antiBot) global.antiBot = {};
        const enabled = option === 'on';
        global.antiBot[from] = enabled;

        if (!global.groupSettings) global.groupSettings = {};
        if (!global.groupSettings[from]) global.groupSettings[from] = {};
        global.groupSettings[from].antiBot = enabled ? 'ON' : 'OFF';

        await sock.sendMessage(from, { text: `✅ Anti‑bot ${enabled ? 'enabled' : 'disabled'}. ${enabled ? 'New members will be kicked automatically.' : ''}` }, { quoted: msg });
    }
};
