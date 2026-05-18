module.exports = {
    name: 'readreceipts',
    category: 'owner',
    description: 'Toggle auto-read receipts (blue ticks) for incoming messages',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isSudo = global.sudo && (global.sudo.has ? global.sudo.has(sender) : global.sudo.includes(sender));
        if (!isArchitect && !isSudo) {
            return sock.sendMessage(from, { text: '❌ Owner or sudo only command.' }, { quoted: msg });
        }

        if (!args[0]) {
            const status = global.autoRead ? 'enabled' : 'disabled';
            return sock.sendMessage(from, { text: `📖 Read receipts are currently ${status}. Use .readreceipts on/off to change.` }, { quoted: msg });
        }

        const option = args[0].toLowerCase();
        if (option !== 'on' && option !== 'off') {
            return sock.sendMessage(from, { text: '❌ Usage: .readreceipts on / off' }, { quoted: msg });
        }

        global.autoRead = option === 'on';
        await sock.sendMessage(from, { text: `✅ Read receipts ${global.autoRead ? 'enabled' : 'disabled'}.` }, { quoted: msg });
    }
};
