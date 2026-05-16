module.exports = {
    name: "antiedit",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        const isSudo = global.sudoUsers?.has(sender) || false;
        if (!isOwner && !isSudo) return sock.sendMessage(from, { text: "❌ Command restricted to the owner and sudo users only." });

        const state = args[0]?.toLowerCase();
        if (state === "on") {
            global.antiEditEnabled = true;
            await sock.sendMessage(from, { text: "✏️ Anti‑edit ENABLED globally. Edited messages will be sent to your private chat." });
        } else if (state === "off") {
            global.antiEditEnabled = false;
            await sock.sendMessage(from, { text: "✏️ Anti‑edit DISABLED." });
        } else {
            await sock.sendMessage(from, { text: "Usage: .antiedit on/off" });
        }
    }
};
