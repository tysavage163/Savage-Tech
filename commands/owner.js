module.exports = {
    name: 'owner',
    description: 'Show owner contact info',
    async execute(sock, m) {
        // Your specific details
        const ownerNumber = '254101277656'; 
        const ownerName = 'Beck Spencer'; 

        const vcard = 'BEGIN:VCARD\n'
                    + 'VERSION:3.0\n' 
                    + `FN:${ownerName}\n`
                    + 'ORG:Savage-Tech Software Solutions;\n' 
                    + 'TITLE:Software Developer;\n'
                    + `ADR;type=WORK;type=pref:;;Westlands;Nairobi;;00800;Kenya\n` 
                    + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n`
                    + 'END:VCARD';

        // Send the Contact Card
        await sock.sendMessage(m.key.remoteJid, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });

        // Send a follow-up text message
        await sock.sendMessage(m.key.remoteJid, { 
            text: `*SAVAGE-TECH OWNER*\n\nDeveloped by ${ownerName}, a Software Developer based in Westlands. Reach out for bot inquiries or custom builds!` 
        }, { quoted: m });
    }
};
