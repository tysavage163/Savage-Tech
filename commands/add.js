module.exports = {
    name: "add",
    category: "group",
    description: "Add a user to the group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        const num = args[0]?.replace(/[^0-9]/g, '');
        if (!num) return sock.sendMessage(from, { text: "👤 *SΛVΛGΞ:* Provide a number to integrate. (Example: .add 254123456789)" });

        try {
            const jid = num + '@s.whatsapp.net';
            await sock.groupParticipantsUpdate(from, [jid], "add");
            await sock.sendMessage(from, { text: `✅ **USER INTEGRATED:** +${num} has been added.` });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ *ERROR:* Failed to add user. Ensure I am an Admin." });
        }
    }
};
