const fs = require('fs');

module.exports = {
    name: 'setmenuimage',
    category: 'owner',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;

        // Security: Only you (The Architect) should change this
        if (!isArchitect) return sock.sendMessage(from, { text: "❌ Access Denied. Only the Architect can reconfigure the UI." });

        const newLink = args[0];
        if (!newLink || !newLink.startsWith('http')) {
            return sock.sendMessage(from, { text: "❌ Please provide a valid image URL.\nUsage: .setmenuimage https://example.com/image.jpg" });
        }

        // Save the link to a settings file
        const settings = { menuImage: newLink };
        fs.writeFileSync('./database.json', JSON.stringify(settings, null, 2));

        await sock.sendMessage(from, { text: `✅ *SYSTEM UPDATED*\n\nNew menu image has been locked in. Use .menu to view changes.` }, { quoted: msg });
    }
};
