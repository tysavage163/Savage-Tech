module.exports = {
    name: "kickall",
    category: "group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        const metadata = await sock.groupMetadata(from);
        const toKick = metadata.participants.filter(v => v.admin === null).map(v => v.id);

        if (toKick.length === 0) return sock.sendMessage(from, { text: "🛡️ **SΛVΛGΞ:** No non-admins found to purge." });

        await sock.sendMessage(from, { text: `☣️ **THE PURGE BEGINS:** Removing ${toKick.length} members...` });

        for (let user of toKick) {
            await sock.groupParticipantsUpdate(from, [user], "remove");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent spam ban
        }
    }
};
