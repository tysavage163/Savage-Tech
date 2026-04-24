import fs from 'fs';

export const name = 'menu';
export const category = 'system';
export const execute = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    // 1. Setup the bucket for your commands
    const categories = {
        admin: [],
        downloads: [],
        automation: [],
        system: []
    };

    // 2. Automatically pull every command loaded in the global Map
    global.commands.forEach((cmd, name) => {
        const cat = cmd.category ? cmd.category.toLowerCase() : 'system';
        if (categories[cat]) {
            categories[cat].push(name);
        } else {
            // Creates new categories on the fly if they don't exist yet
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(name);
        }
    });

    // 3. The Design (Chains & Biohazard)
    let menuText = `
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  *☣ SAVAGE-TECH ☣*
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  👤 *ARCHITECT:* Spencer
┃  🛡️ *STATUS:* Active
┃  ⌛ *UPTIME:* ${Math.floor(process.uptime() / 60)}m
┃  ⌨️ *PREFIX:* [  ${global.prefix}  ]
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍`;

    // 4. Map the display titles
    const categoryLabels = {
        admin: 'ADMIN (GC)',
        downloads: 'DOWNLOADS',
        automation: 'AUTOMATION',
        system: 'SYSTEM & TOOLS'
    };

    // 5. Generate the command list table
    for (const [key, label] of Object.entries(categoryLabels)) {
        if (categories[key] && categories[key].length > 0) {
            menuText += `\n┃  *${label}*`;
            categories[key].sort().forEach(cmdName => {
                menuText += `\n┃  » ${global.prefix}${cmdName}`;
            });
            menuText += `\n⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍`;
        }
    }

    // 6. The Architect's Quote
    menuText += `
┃ _"Master your tools or be_
┃  _mastered by them."_
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍`;

    // 7. Final Dispatch with your Header Image
    await sock.sendMessage(from, { 
        image: { url: 'https://i.ibb.co/680pZ7V/1777019342227.jpg' }, 
        caption: menuText 
    }, { quoted: msg });
};
