module.exports = {
    name: 'menu',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const menuImage = 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/e91b4f95-67b1-4819-b737-b033df5d7e3b.jpg';

        const text = `
*───「 SAVAGE-TECH V1 」───*
👤 *Dev:* Beck Spencer
📍 *Loc:* Nairobi, KE
⚔️ *Prefix:* [ . ]
──────────────────

*MAIN COMMANDS*
• .ping
• .alive
• .owner
• .menu
• .sticker
• .kick
• .promote
• .hidetag
• .tt
• .dl
• .admin
• .setgdesc

_Powered by Savage-Tech Solutions_`;

        await sock.sendMessage(from, { 
            image: { url: menuImage }, 
            caption: text 
        }, { quoted: msg });
    }
};
