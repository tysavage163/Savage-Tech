module.exports = {
    name: 'leave',
    category: 'group',
    desc: 'Authorized extraction only.',
    execute: async (sock, msg, args, { isArchitect, isMe }) => {
        const from = msg.key.remoteJid;
        
        // --- DYNAMIC JID CLEANING ---
        const sender = msg.key.participant || msg.key.remoteJid;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const cleanSender = sender.split(':')[0] + '@s.whatsapp.net';

        // Check if sender is the bot owner (Me) or matches the bot's own ID
        const hasClearance = isMe || isArchitect || cleanSender === botId;

        if (!from.endsWith('@g.us')) return;

        if (!hasClearance) {
            return sock.sendMessage(from, { 
                text: "❌ *ACCESS DENIED: SYSTEM LOCK.*\n\nOnly the System Architect has the clearance to sever this connection." 
            });
        }

        const coldQuotes = [
            "Perimeter compromised. SΛVΛGΞ-TECH is vacating the sector.",
            "Connection severed. I am not where you left me.",
            "Silence is the ultimate weapon. Withdrawal initiated.",
            "System extraction authorized. Leaving no footprints.",
            "Architecture shifting. This location is now obsolete."
        ];

        const randomQuote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];

        await sock.sendMessage(from, { text: `☢️ *EXTRACTION INITIATED*\n\n"${randomQuote}"` });

        setTimeout(async () => {
            try {
                await sock.groupLeave(from);
            } catch (e) {
                console.error("❌ Extraction Failed:", e);
            }
        }, 2000);
    }
};
