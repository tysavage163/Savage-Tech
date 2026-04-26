module.exports = {
    category: 'tools',
    name: 'getpp',
    category: 'tools',
    desc: 'Extract profile pictures with cold precision',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     (from.endsWith('@g.us') ? msg.key.participant : from);

        // Cold Quotes Array
        const coldQuotes = [
            "Identity captured. You're just data in my system now.",
            "In a world of copies, I just took the original.",
            "Privacy is an illusion. I see everything.",
            "Consider this a souvenir of your digital existence.",
            "Power isn't given, it's taken. Just like this picture.",
            "Your profile is now property of SΛVΛGΞ-TECH."
        ];

        const randomQuote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];

        try {
            const ppUrl = await sock.profilePictureUrl(target, 'image');

            await sock.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: `❄️ *${randomQuote}*\n\n_Built by Spencer inspired by Meryl_` 
            }, { quoted: msg });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: "❌ *Target is ghosting the system.* (No DP or Privacy Blocked)." 
            }, { quoted: msg });
        }
    }
};
