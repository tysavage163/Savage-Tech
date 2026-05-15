const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "savestatus",
    category: "tools",
    description: "Save a status update (story) by replying to it",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: "❌ Reply to a status message (story)." });
        }
        const quotedRemoteJid = quoted?.key?.remoteJid;
        if (quotedRemoteJid !== "status@broadcast") {
            return sock.sendMessage(from, { text: "❌ This is not a status message. Reply to a story." });
        }
        let mediaType = null;
        let mediaObj = null;
        if (quoted.imageMessage) {
            mediaType = "image";
            mediaObj = quoted.imageMessage;
        } else if (quoted.videoMessage) {
            mediaType = "video";
            mediaObj = quoted.videoMessage;
        } else {
            return sock.sendMessage(from, { text: "❌ Unsupported status type (only images and videos)." });
        }
        try {
            const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
            if (!buffer) throw new Error("Download failed");
            const caption = `📥 *Status saved*\nFrom: ${quoted.key.participant?.split('@')[0] || "Unknown"}\nType: ${mediaType}`;
            if (mediaType === "image") {
                await sock.sendMessage(from, { image: buffer, caption });
            } else {
                await sock.sendMessage(from, { video: buffer, caption });
            }
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: `❌ Failed to save status: ${err.message}` });
        }
    }
};
