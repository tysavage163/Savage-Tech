module.exports = {
    name: "removesudo",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." });

        if (!global.sudoUsers) global.sudoUsers = new Set();

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: "❌ Reply to a user's message to remove sudo." });
        }

        let target = quoted?.key?.participant || quoted?.key?.remoteJid;
        if (!target) return sock.sendMessage(from, { text: "❌ Could not identify the user." });

        if (!global.sudoUsers.has(target)) {
            return sock.sendMessage(from, { text: `⚠️ User does not have sudo privileges.` });
        }

        global.sudoUsers.delete(target);
        await sock.sendMessage(from, { text: `✅ Sudo removed from ${target.split('@')[0]}` });
    }
};
