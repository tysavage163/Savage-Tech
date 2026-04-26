module.exports = {
    name: "pingall",
    category: "group",
    description: "Tag every member in the group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        // 🛡️ SECURITY GATE
        if (!isGroup) return sock.sendMessage(from, { text: "❌ This command only works in groups." });
        if (!isMe) return; // Only the host can ping everyone

        try {
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants;
            let mentions = [];
            let message = "⛓️ **SΛVΛGΞ ATTENTION PROTOCOL** ⛓️\n\n";

            for (let participant of participants) {
                message += ` @${participant.id.split('@')[0]}`;
                mentions.push(participant.id);
            }

            await sock.sendMessage(from, { 
                text: message.trim(), 
                mentions: mentions 
            }, { quoted: msg });

        } catch (error) {
            console.error("PINGALL ERROR:", error);
            await sock.sendMessage(from, { text: "❌ Failed to retrieve group members." });
        }
    }
};
