module.exports = {
    name: 'menu',
    description: 'Display the bot command list',
    async execute(sock, m) {
        const menuText = `
╭───  *SAVAGE-TECH V1* ───
│ 👤 *Developer:* Beck Spencer
│ 📍 *Location:* Nairobi, KE
│ 🛠 *Prefix:* [ ! ]
╰─────────────────────────

*MAIN COMMANDS*
• !ping - Check Bot Latency
• !owner - Get Beck's Contact
• !menu - Show this list

_Powered by Savage-Tech Software Solutions_
        `;

        await sock.sendMessage(m.key.remoteJid, { 
            text: menuText 
        }, { quoted: m });
    }
};
