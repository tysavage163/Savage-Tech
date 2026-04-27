module.exports = {
    name: "tagadmin",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        try {
            // ⚡ Pull from internal cache instead of a full fetch
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            
            // Filter only those with 'admin' or 'superadmin' status
            const admins = participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id);

            if (admins.length === 0) {
                return sock.sendMessage(from, { text: "⚠️ **SYSTEM:** No admins detected or cache empty." });
            }

            const mentionText = args.join(" ") || "Admin attention required!";

            await sock.sendMessage(from, { 
                text: `⛓️ **SΛVΛGΞ ADMIN ALERT** ⛓️\n\n${mentionText}`, 
                mentions: admins 
            }, { quoted: msg });

        } catch (e) {
            console.error("TagAdmin Error:", e);
            await sock.sendMessage(from, { text: "❌ **LINK FAILURE:** Bot must be admin to read the participant list." });
        }
    }
};
