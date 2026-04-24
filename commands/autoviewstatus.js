module.exports = {
    name: 'autoviewstatus',
    category: 'admin',
    execute: async (sock, msg, args, { hasAccess }) => {
        const from = msg.key.remoteJid;
        if (!hasAccess) return sock.sendMessage(from, { text: '❌ Access Denied.' });

        const input = args[0]?.toLowerCase();

        if (input === 'on') {
            global.autoViewStatus = 'on';
            return sock.sendMessage(from, { text: '👁️ *AUTO-VIEW STATUS:* ENABLED' });
        }

        if (input === 'off') {
            global.autoViewStatus = 'off';
            return sock.sendMessage(from, { text: '🙈 *AUTO-VIEW STATUS:* DISABLED' });
        }

        const current = global.autoViewStatus === 'on' ? 'ENABLED 👁️' : 'DISABLED 🙈';
        await sock.sendMessage(from, { 
            text: `*S Λ V Λ G Ξ  -  STATUS ENGINE*\n\n*Current:* ${current}\n\n*Usage:*\n${global.prefix}autoviewstatus on\n${global.prefix}autoviewstatus off` 
        });
    }
};
