module.exports = {
    name: "kickall",
    category: "group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        // 🚨 STRICT OWNER CHECK
        if (!isMe || !from.endsWith('@g.us')) return;

        const metadata = await sock.groupMetadata(from);
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Filter: No admins and definitely not the bot itself
        const targets = metadata.participants
            .filter(p => p.admin === null && p.id !== botNumber)
            .map(p => p.id);

        if (targets.length === 0) {
            return sock.sendMessage(from, { text: "🛡️ **SΛVΛGΞ:** The perimeter is clear. No non-admins detected." });
        }

        await sock.sendMessage(from, { text: `☣️ **PURGE PROTOCOL:** Removing ${targets.length} targets...` });

        for (let target of targets) {
            await sock.groupParticipantsUpdate(from, [target], "remove");
            // 🕒 1.5 second delay to stay under WhatsApp's radar
            await new Promise(resolve => setTimeout(resolve, 1500)); 
        }

        await sock.sendMessage(from, { text: "🏁 **PURGE COMPLETE.**" });
    }
};
