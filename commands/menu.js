const fs = require('fs');

module.exports = {
    name: 'menu',
    category: 'system',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;

        // 1. Setup Categories
        const categories = {
            admin: [],
            downloads: [],
            automation: [],
            system: []
        };

        // 2. Map through all loaded commands automatically
        global.commands.forEach((cmd, name) => {
            const cat = cmd.category ? cmd.category.toLowerCase() : 'system';
            if (categories[cat]) {
                categories[cat].push(name);
            } else {
                // Creates a new category on the fly if it's not in the list
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(name);
            }
        });

        // 3. Header & Stats
        let menuText = `
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  *☣ SAVAGE-TECH ☣*
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  👤 *ARCHITECT:* Spencer
┃  🛡️ *STATUS:* Active
┃  ⌛ *UPTIME:* ${Math.floor(process.uptime() / 60)}m
┃  ⌨️ *PREFIX:* [  ${global.prefix}  ]
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍`;

        // 4. Dynamic Body Construction
        const categoryLabels = {
            admin: 'ADMIN (GC)',
            downloads: 'DOWNLOADS',
            automation: 'AUTOMATION',
            system: 'SYSTEM & TOOLS'
        };

        // This loop builds the table sections only for categories that have commands
        for (const [key, label] of Object.entries(categoryLabels)) {
            if (categories[key] && categories[key].length > 0) {
                menuText += `\n┃  *${label}*`;
                categories[key].sort().forEach(cmd => {
                    menuText += `\n┃  » ${global.prefix}${cmd}`;
                });
                menuText += `\n⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍`;
            }
        }

        // 5. The Architect's Quote
        menuText += `
┃ _"Master your tools or be_
┃  _mastered by them."_
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍`;

        // 6. Final Dispatch
        await sock.sendMessage(from, { 
            image: { url: 'https://i.ibb.co/680pZ7V/1777019342227.jpg' }, 
            caption: menuText 
        }, { quoted: msg });
    }
};
