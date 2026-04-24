module.exports = {
    name: 'owner',
    category: 'info',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const myNumber = "254798841125";
        
        const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN:Spencer\n' 
            + `TEL;type=CELL;type=VOICE;waid=${myNumber}:+${myNumber}\n` 
            + 'END:VCARD';

        const compactTable = `
┌─── SΛVΛGΞ-TECH CORE ───┐
│ 👑 ARCHITECT: Spencer  │
│ 📍 LOC: Westlands, NBO │
│ 🛠️ STATUS: Supreme Dev │
└────────────────────────┘
*Built by Spencer inspired by Meryl*
        `.trim();

        // 1. Text-Only Dashboard (No external image URL)
        await sock.sendMessage(from, { 
            text: compactTable 
        }, { quoted: msg });

        // 2. Contact Card Pop-up
        await sock.sendMessage(from, {
            contacts: {
                displayName: "Spencer",
                contacts: [{ vcard }]
            }
        }, { quoted: msg });
    }
};
