module.exports = {
    name: 'modestatus',
    category: 'owner',
    description: 'Show current bot mode (public/private)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isSudo = global.sudo && (global.sudo.has ? global.sudo.has(sender) : global.sudo.includes(sender));
        if (!isArchitect && !isSudo) {
            return sock.sendMessage(from, { text: '❌ Owner or sudo only command.' }, { quoted: msg });
        }

        const mode = global.worktype === 'public' ? '🌍 Public' : '🔒 Private';
        await sock.sendMessage(from, { text: `📌 Current bot mode: ${mode}` }, { quoted: msg });
    }
};
