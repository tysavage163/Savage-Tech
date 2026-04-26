module.exports = {
    category: 'group',
    name: 'kick',
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
            return sock.sendMessage(from, { text: "❌ *Access Denied.* You lack the clearance to initiate an execution." });
        }

        // Target Logic (Tag or Reply)
        const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targets = mentioned.length > 0 ? mentioned : (quotedMessage ? [quotedMessage] : []);

        if (targets.length === 0) return sock.sendMessage(from, { text: 'Tag the victim or reply to their message.' });

        // 2. ULTIMATE PROTECTION: No one kicks Spencer
        if (targets.includes(ownerNumber)) {
            return sock.sendMessage(from, { text: "⚠️ *System Alert:* Critical error. You cannot terminate the Architect." });
        }

        // 🛰️ SAVAGE QUOTES
        const kickQuotes = [
            "Target eliminated. Perfection requires pruning.",
            "You were a glitch in the system. Deleted.",
            "The hierarchy has no room for the weak.",
            "Execution successful. Don't look back.",
            "Spencer's bot doesn't tolerate noise. Goodbye.",
            "Connection severed. Your presence was an error.",
            "Access revoked permanently. The system is clean now."
        ];
        const quote = kickQuotes[Math.floor(Math.random() * kickQuotes.length)];

        try {
            await sock.groupParticipantsUpdate(from, targets, "remove");
            await sock.sendMessage(from, { 
                text: `👤 *ELIMINATION COMPLETE*\n\n"${quote}"` 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "Action failed. I likely lack Admin rights to execute this command." });
        }
    }
};
