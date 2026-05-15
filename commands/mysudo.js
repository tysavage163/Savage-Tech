module.exports = {
    name: "mysudo",
    category: "tools",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!global.sudoUsers) global.sudoUsers = new Set();
        const isSudo = global.sudoUsers.has(sender);
        await sock.sendMessage(from, { text: isSudo ? "✅ You have sudo privileges." : "❌ You do not have sudo privileges." });
    }
};
