module.exports = {
    name: 'demote',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const sender = msg.key.participant || msg.key.remoteJid;
        const ownerNumber = '254798841125@s.whatsapp.net';

        // 1. Permission Check: Is the sender an Admin or the Owner?
        const isSenderAdmin = participants.find(p => p.id === sender)?.admin !== null;
        const isOwner = sender === ownerNumber;
        if (!isSenderAdmin && !isOwner) {
            return sock.sendMessage(from, { text: "❌ *Access Denied.* You lack the clearance to strip authority." });
        }

        // Target Logic (Tag or Reply)
        const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targets = mentioned.length > 0 ? mentioned : (quotedMessage ? [quotedMessage] : []);

        if (targets.length === 0) return sock.sendMessage(from, { text: 'Tag the individual or reply to their message to revoke power.' });

        // 2. SPENCER SHIELD: Protect the Architect from demotion
        if (targets.includes(ownerNumber)) {
            return sock.sendMessage(from, { text: "⚠️ *System Fault:* Spencer's authority is absolute. It cannot be revoked." });
        }

        // 🛰️ DEMOTE QUOTES (Sci-Fi X Style)
        const demoteQuotes = [
            "Back to the shadows. Your time in the light is over.",
            "Authority revoked. You have been downgraded to civilian status.",
            "Rank reset. Spencer's standards were not met.",
            "The crown was too heavy. I'll take it back now.",
            "Access level reduced. Know your place in the system.",
            "Power surge detected... and extinguished. You are no longer Admin.",
            "The hierarchy has been recalibrated. You are now obsolete."
        ];
        const quote = demoteQuotes[Math.floor(Math.random() * demoteQuotes.length)];

        try {
            await sock.groupParticipantsUpdate(from, targets, "demote");
            await sock.sendMessage(from, { 
                text: `📉 *RANK REVOKED*\n\n"${quote}"` 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "Demotion failed. Check my Admin status." });
        }
    }
};
