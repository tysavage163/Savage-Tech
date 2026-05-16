module.exports = {
    name: "antidelete",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        const isSudo = global.sudoUsers?.has(sender) || false;
        if (!isOwner && !isSudo) return sock.sendMessage(from, { text: "❌ Command restricted to the owner and sudo users only." });

        const state = args[0]?.toLowerCase();
        if (state === "on") {
            global.antiDeleteEnabled = true;
            await sock.sendMessage(from, { text: "🛡️ Anti‑delete ENABLED globally. Deleted messages will be sent to your private chat." });
        } else if (state === "off") {
            global.antiDeleteEnabled = false;
            await sock.sendMessage(from, { text: "🛡️ Anti‑delete DISABLED." });
        } else {
            await sock.sendMessage(from, { text: "Usage: .antidelete on/off" });
        }
    }
};
