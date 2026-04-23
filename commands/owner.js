module.exports = {
    name: 'owner',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // 🛠️ ARCHITECT DATA
        const ownerNumber = '254798841125';
        const ownerName = 'Beck Spencer';
        const location = 'Westlands, Nairobi, Kenya';
        const organization = 'Microsoft';

        // 1. GENERATE V-CARD (Professional Contact)
        const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + `FN:${ownerName}\n` 
            + `ORG:${organization};\n` 
            + `TITLE:Systems Architect;\n`
            + `ADR;type=WORK;type=pref:;;${location};;;;\n`
            + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` 
            + 'END:VCARD';

        // Send the Contact Card
        await sock.sendMessage(from, { 
            contacts: { 
                displayName: ownerName, 
                contacts: [{ vcard }] 
            }
        });

        // 2. SEND SYSTEM IDENTITY BLOCK
        const identityBlock = `
┎──────────────────────────╼
┃   👑 𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐑𝐂𝐇𝐈𝐓𝐄𝐂𝐓  
┖──────────────────────────╼
┃
┃ 👤 *NAME:* ${ownerName}
┃ 🏢 *CORP:* ${organization}
┃ 📱 *WHATSAPP:* +${ownerNumber}
┃ 📍 *SECTOR:* ${location}
┃ 🛠️ *STATUS:* Supreme Developer
┃
┃ _Proprietary systems active._
┃ _Under Microsoft Neural Protocols._
┖──────────────────────────╼
`;

        await sock.sendMessage(from, { text: identityBlock }, { quoted: msg });
    }
};
