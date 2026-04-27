module.exports = {
    name: "tagall",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants.map(v => v.id);

        let message = `📣 **SΛVΛGΞ TOTAL RECALL** 📣\n\n${args.join(" ") || "All units, report!"}\n\n`;
        participants.forEach(mem => { message += `🔹 @${mem.split('@')[0]}\n`; });

        await sock.sendMessage(from, { text: message, mentions: participants }, { quoted: msg });
    }
};
