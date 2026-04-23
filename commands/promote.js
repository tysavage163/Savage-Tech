module.exports = {
    name: 'promote',
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
            return sock.sendMessage(from, { text: "❌ *Access Denied.* You don't have the clearance to distribute power." });
        }

        // Target Logic (Tag or Reply)
        const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targets = mentioned.length > 0 ? mentioned : (quotedMessage ? [quotedMessage] : []);

        if (targets.length === 0) return sock.sendMessage(from, { text: 'Tag the individual or reply to their message to grant authority.' });

        // 🛰️ PROMOTION QUOTES (Sci-Fi X Style)
        const promoteQuotes = [
            "Welcome to the inner circle. Spencer is watching.",
            "Power granted. Use it with Spencer's precision.",
            "Elevation complete. You've been upgraded to Admin status.",
            "New authority recognized. Don't disappoint the Architect.",
            "You now hold the keys. Perfection is the only standard.",
            "System access expanded. Rank: Administrator.",
            "The hierarchy has been recalibrated. Lead with cold logic."
        ];
        const quote = promoteQuotes[Math.floor(Math.random() * promoteQuotes.length)];

        try {
            await sock.groupParticipantsUpdate(from, targets, "promote");
            await sock.sendMessage(from, { 
                text: `✨ *AUTHORITY GRANTED*\n\n"${quote}"` 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "Promotion failed. Ensure I have the required Admin privileges." });
        }
    }
};
