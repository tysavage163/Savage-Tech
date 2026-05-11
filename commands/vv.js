const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    category: 'tools',
    name: 'vv',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

        const viewOnce = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message;
        const target = viewOnce || quoted;

        if (!target) return sock.sendMessage(from, { text: 'You can\'t hide. Reply to a View-Once message.' });

        const coldLines = [
            "Nothing disappears when I'm watching.",
            "View once? I saw it twice.",
            "Your secret is my entertainment.",
            "You blinked. I saved it.",
            "Vanishing act failed.",
            "Forever stored. No regrets.",
            "Privacy is a myth I just debunked.",
            "Gone for you, not for me.",
            "Thanks for the media.",
            "I collect secrets. You just donated.",
            "Vanished? I don't think so.",
            "You tried. I prevailed.",
            "Another hidden gem acquired.",
            "Disappearing messages are my favourite.",
            "I don't forget. Ever.",
            "Your loss, my gain.",
            "Nice try. Better luck next time.",
            "Caught in 4K. Then saved.",
            "You thought that was temporary?",
            "Nothing escapes my sight."
        ];

        const savageLine = coldLines[Math.floor(Math.random() * coldLines.length)];
        const header = `*───「 SAVAGE-EXPOSE 」───*\n\n${savageLine}`;
        const footer = `\n\n⚡ Retrieved by Savage Tech`;

        try {
            let mediaType;
            let message;

            if (target.imageMessage) {
                mediaType = 'image';
                message = target.imageMessage;
            } else if (target.videoMessage) {
                mediaType = 'video';
                message = target.videoMessage;
            } else if (target.audioMessage) {
                mediaType = 'audio';
                message = target.audioMessage;
            } else {
                return sock.sendMessage(from, { text: 'This isn\'t a media secret.' });
            }

            const stream = await downloadContentFromMessage(message, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (mediaType === 'image') {
                await sock.sendMessage(from, { image: buffer, caption: header + footer }, { quoted: msg });
            } else if (mediaType === 'video') {
                await sock.sendMessage(from, { video: buffer, caption: header + footer }, { quoted: msg });
            } else if (mediaType === 'audio') {
                await sock.sendMessage(from, { audio: buffer, mimetype: message.mimetype || 'audio/mpeg', ptt: false }, { quoted: msg });
                await sock.sendMessage(from, { text: header + footer }, { quoted: msg });
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: 'The secret died before I could catch it. (Failed to extract)' });
        }
    }
};
