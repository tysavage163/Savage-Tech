module.exports = {
    name: 'autoviewstatus',
    category: 'owner', // Elevated Clearance Level
    desc: 'Toggle automatic status viewing for the Architect.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;

        // Matches the { isArchitect } flag passed from your index.js
        if (!isArchitect) {
            return sock.sendMessage(from, { 
                text: '❌ *Access Denied.* Restricted to the System Architect.' 
            });
        }

        const input = args[0]?.toLowerCase();

        if (input === 'on') {
            global.autoViewStatus = 'on';
            return sock.sendMessage(from, { text: '👁️ *AUTO-VIEW STATUS:* ENABLED' });
        }

        if (input === 'off') {
            global.autoViewStatus = 'off';
            return sock.sendMessage(from, { text: '🙈 *AUTO-VIEW STATUS:* DISABLED' });
        }

        // Default response if no 'on/off' is provided
        const current = global.autoViewStatus === 'on' ? 'ENABLED 👁️' : 'DISABLED 🙈';
        await sock.sendMessage(from, { 
            text: `*S Λ V Λ G Ξ  -  STATUS ENGINE*\n\n*Current Clearance:* OWNER\n*Status:* ${current}\n\n*Usage:*\n${global.prefix}autoviewstatus on\n${global.prefix}autoviewstatus off` 
        });
    }
};
