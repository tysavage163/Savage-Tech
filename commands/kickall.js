module.exports = {
    name: "kickall",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        try {
            const metadata = await sock.groupMetadata(from);
            const targets = metadata.participants.filter(p => p.admin === null).map(p => p.id);

            if (targets.length === 0) return sock.sendMessage(from, { text: "🛡️ **SΛVΛGΞ:** No targets found." });

            await sock.sendMessage(from, { text: `☣️ **PURGE:** Removing ${targets.length} members...` });

            for (let user of targets) {
                await sock.groupParticipantsUpdate(from, [user], "remove");
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **ERROR:** Am I an Admin?" });
        }
    }
};
