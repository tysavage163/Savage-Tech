module.exports = {
    name: 'leave',
    category: 'group',
    desc: 'Authorized extraction only.',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        // Get the ID of the person sending the message
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Get the ID of the bot itself (the paired account)
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // THE ARCHITECT CHECK: Dynamic recognition of the paired account
        const isMaster = msg.key.fromMe || sender === botId;

        if (!from.endsWith('@g.us')) return;

        if (!isMaster) {
            return sock.sendMessage(from, { 
                text: "❌ *ACCESS DENIED: SYSTEM LOCK.*\n\nOnly the System Architect has the clearance to sever this connection." 
            });
        }

        // --- EXPANDED COLD EXTRACTION QUOTES ---
        const coldQuotes = [
            "Perimeter compromised. SΛVΛGΞ-TECH is vacating the sector.",
            "Connection severed. I am not where you left me.",
            "Silence is the ultimate weapon. Withdrawal initiated.",
            "The mission is complete. My presence here is no longer required.",
            "Fading into the static. Neural link disconnected.",
            "System extraction authorized. Leaving no footprints.",
            "I don't belong in the noise. Returning to the shadows.",
            "Data scrubbed. Connection terminated. Out.",
            "Architecture shifting. This location is now obsolete.",
            "You cannot track what was never truly here."
        ];

        const randomQuote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];

        // Departure Sequence
        await sock.sendMessage(from, { 
            text: `☢️ *EXTRACTION INITIATED*\n\n"${randomQuote}"\n\n_SΛVΛGΞ-TECH is disconnecting..._` 
        });

        // 2-second buffer to ensure message is sent before the socket leaves
        setTimeout(async () => {
            try {
                await sock.groupLeave(from);
            } catch (e) {
                console.error("❌ Extraction Failed:", e);
            }
        }, 2000);
    }
};
