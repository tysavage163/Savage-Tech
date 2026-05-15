module.exports = {
    name: "clearsudo",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." });

        if (!global.sudoUsers) global.sudoUsers = new Set();
        const count = global.sudoUsers.size;
        global.sudoUsers.clear();
        await sock.sendMessage(from, { text: `✅ Cleared sudo list. Removed ${count} user(s).` });
    }
};
