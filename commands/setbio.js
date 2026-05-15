module.exports = {
    name: "setbio",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        const isSudo = global.sudoUsers?.has(sender) || false;
        if (!isOwner && !isSudo) return sock.sendMessage(from, { text: "❌ Command restricted to the owner and sudo users only." });
        const newBio = args.join(" ");
        if (!newBio) return sock.sendMessage(from, { text: "❌ Usage: .setbio <your new bio text>" });
        try {
            await sock.updateProfileStatus(newBio);
            await sock.sendMessage(from, { text: `✅ Bio updated to:\n"${newBio}"\n\n_⚡ Powered by Savage Tech_` });
        } catch (err) {
            console.error("Setbio error:", err);
            await sock.sendMessage(from, { text: `❌ Failed to update bio: ${err.message}` });
        }
    }
};
