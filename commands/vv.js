const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'vv',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

        // Detection logic for View-Once
        const viewOnce = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message;
        const target = viewOnce || quoted;

        if (!target) return sock.sendMessage(from, { text: 'You can\'t hide. Reply to a View-Once message.' });

        // Cold Savage VV Quotes
        const coldLines = [
            "Privacy is an illusion I don't believe in.",
            "You thought it was gone? I kept the receipts.",
            "Deleted for you, permanent for me.",
            "I see through your 'disappearing' acts.",
            "Nice try. My eyes never close.",
            "The internet never forgets, and neither do I.",
            "Bypassed. Your secrets aren't safe here.",
            "You wanted it hidden. I wanted it captured.",
            "Transparency is mandatory when I'm around.",
            "Captured. Don't play hide and seek with a wolf."
        ];

        const savageLine = coldLines[Math.floor(Math.random() * coldLines.length)];

        try {
            let mediaType;
            let message;

            if (target.imageMessage) {
                mediaType = 'image';
                message = target.imageMessage;
            } else if (target.videoMessage) {
                mediaType = 'video';
                message = target.videoMessage;
            } else {
                return sock.sendMessage(from, { text: 'This isn\'t a media secret.' });
            }

            const stream = await downloadContentFromMessage(message, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const header = `*───「 SAVAGE-EXPOSE 」───*\n\n"${savageLine}"`;

            if (mediaType === 'image') {
                await sock.sendMessage(from, { image: buffer, caption: header }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { video: buffer, caption: header }, { quoted: msg });
            }

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: 'The secret died before I could catch it. (Failed to extract)' });
        }
    }
};
