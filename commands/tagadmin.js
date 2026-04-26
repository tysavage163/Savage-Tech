module.exports = {
    name: "tagadmin",
    category: "group",
    description: "Ping all admins in the group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(v => v.admin !== null).map(v => v.id);
        const text = args.join(" ") || "Admin attention required.";

        await sock.sendMessage(from, { 
            text: `⚠️ **ADMIN PROTOCOL** ⚠️\n\n${text}`, 
            mentions: admins 
        }, { quoted: msg });
    }
};
