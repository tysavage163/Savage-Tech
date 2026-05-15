module.exports = {
    name: "sudodebug",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." });

        if (!global.sudoUsers) global.sudoUsers = new Set();
        const list = Array.from(global.sudoUsers);
        const listStr = list.length ? list.map(j => `• ${j}`).join("\n") : "None";
        await sock.sendMessage(from, { text: `🔍 *SUDO DEBUG*\nTotal: ${list.length}\n\n${listStr}` });
    }
};
