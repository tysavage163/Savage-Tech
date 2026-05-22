module.exports = {
    category: 'tools',
    name: 'getpp',
    desc: 'Extract profile pictures with cold precision',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        const normalizeJid = (jid) => {
            if (!jid) return null;
            let clean = jid.split(':')[0];
            if (!clean.includes('@')) clean += '@s.whatsapp.net';
            return clean;
        };

        let target = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (from.endsWith('@g.us') && msg.key.participant) {
            target = msg.key.participant;
        } else if (!from.endsWith('@g.us')) {
            target = from;
        }

        if (!target) {
            return sock.sendMessage(from, { text: "❌ Couldn't identify target." }, { quoted: msg });
        }

        target = normalizeJid(target);

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
            console.error('getpp error:', e);
            await sock.sendMessage(from, {
                text: "❌ *Target is ghosting the system.* (No DP or Privacy Blocked)."
            }, { quoted: msg });
        }
    }
};
