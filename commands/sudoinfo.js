module.exports = {
    name: "sudoinfo",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." });

        if (!global.sudoUsers) global.sudoUsers = new Set();
        const count = global.sudoUsers.size;
        let listMsg = "";
        if (args[0] === "list") {
            const list = Array.from(global.sudoUsers).map(j => `• ${j.split('@')[0]}`).join("\n");
            listMsg = `\n\n📋 *Sudo users* (${count}):\n${list || "None"}`;
        }
        await sock.sendMessage(from, { text: `🔧 *SUDO INFO*\nTotal sudoers: ${count}\n\nUse .addsudo (reply to user) and .removesudo (reply to user)\n.sudoinfo list to see all${listMsg}` });
    }
};
