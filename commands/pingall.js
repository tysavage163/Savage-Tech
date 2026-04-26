module.exports = {
    name: "pingall",
    category: "group",
    description: "Tag every member in the group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        // 🛡️ SECURITY GATE: Master only
        if (!isMe) return; 

        if (!isGroup) {
            return sock.sendMessage(from, { text: "❌ *ERROR:* Group protocol only." }, { quoted: msg });
        }

        try {
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants;
            
            let mentions = [];
            let messageText = `╔════════════════════╗\n   ⛓️ **SΛVΛGΞ ATTENTION** ⛓️\n╚════════════════════╝\n\n📢 **ANNOUNCEMENT:** ${args.length > 0 ? args.join(' ') : 'System Broadcast'}\n\n`;

            for (let participant of participants) {
                messageText += `🔹 @${participant.id.split('@')[0]}\n`;
                mentions.push(participant.id);
            }

            messageText += `\n━━━━━━━━━━━━━━━\n_Architect Beck is calling._ 🌐`;

            await sock.sendMessage(from, { 
                text: messageText, 
                mentions: mentions 
            }, { quoted: msg });

        } catch (error) {
            console.error("PINGALL ERROR:", error);
            await sock.sendMessage(from, { text: "❌ **FAILED:** Metadata extraction error." });
        }
    }
};
