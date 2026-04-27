module.exports = {
    category: 'group',
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
            return sock.sendMessage(from, { text: "❌ *Access Denied.* You lack the clearance to grant authority." });
        }

        // Target Logic (Tag or Reply)
        const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targets = mentioned.length > 0 ? mentioned : (quotedMessage ? [quotedMessage] : []);

        if (targets.length === 0) return sock.sendMessage(from, { text: 'Tag the individual or reply to their message to grant power.' });

        // 🛰️ PROMOTE QUOTES (Ruthless Power Style)
        const promoteQuotes = [
            "Welcome to the inner circle. Do not make the system regret this.",
            "Authority granted. Use it as a weapon, or it will be used against you.",
            "Elevated. The architect sees potential in your wreckage.",
            "Rank updated. You are now a gear in the SΛVΛGΞ engine.",
            "Clearance level increased. The crown is heavy—don't let it crush you.",
            "Power surge initiated. You have been granted Admin status.",
            "The hierarchy has been recalibrated. You have ascended."
        ];
        const quote = promoteQuotes[Math.floor(Math.random() * promoteQuotes.length)];

        try {
            await sock.groupParticipantsUpdate(from, targets, "promote");
            await sock.sendMessage(from, { 
                text: `📈 *RANK ELEVATED*\n\n"${quote}"` 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "Promotion failed. Ensure I am an Admin first." });
        }
    }
};
