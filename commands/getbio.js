module.exports = {
    name: "getbio",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        const isSudo = global.sudoUsers?.has(sender) || false;
        if (!isOwner && !isSudo) return sock.sendMessage(from, { text: "❌ Insufficient privileges." });
        try {
            const status = await sock.fetchStatus(sock.user.id);
            await sock.sendMessage(from, { text: `📝 Current bio: ${status.status || "Not set"}` });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Could not fetch bio: ${err.message}` });
        }
    }
};
