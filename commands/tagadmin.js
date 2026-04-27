module.exports = {
    name: "tagadmin",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        try {
            const metadata = await sock.groupMetadata(from);
            // Filter to get only admins
            const admins = metadata.participants
                .filter(v => v.admin !== null)
                .map(v => v.id);

            if (admins.length === 0) return;

            let messageText = `⛓️ **SΛVΛGΞ ADMIN ALERT** ⛓️\n\n`;
            
            // Build the visible text part
            admins.forEach((admin) => {
                messageText += `🔹 @${admin.split('@')[0]}\n`;
            });

            if (args.join(" ")) messageText += `\n📝 **MESSAGE:** ${args.join(" ")}`;

            // The 'mentions' field MUST contain the full JIDs (e.g. 123@s.whatsapp.net)
            await sock.sendMessage(from, { 
                text: messageText, 
                mentions: admins 
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ **LINK ERROR:** I need Admin rights to read the participant list." });
        }
    }
};
