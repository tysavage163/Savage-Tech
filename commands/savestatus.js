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
        let mediaType = null;
        let mediaMsg = null;
        if (quoted.imageMessage) {
            mediaType = "image";
            mediaMsg = quoted.imageMessage;
        } else if (quoted.videoMessage) {
            mediaType = "video";
            mediaMsg = quoted.videoMessage;
        } else {
            return sock.sendMessage(from, { text: "❌ This is not a status message with image/video. Reply to a story." });
        }
        try {
            const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
            if (!buffer || buffer.length === 0) throw new Error("Download failed");
            let owner = "Unknown";
            if (quoted.key?.participant) {
                owner = quoted.key.participant.split('@')[0];
            } else if (quoted.key?.remoteJid && quoted.key.remoteJid !== "status@broadcast") {
                owner = quoted.key.remoteJid.split('@')[0];
            }
            const caption = `📥 *Status saved*\nFrom: ${owner}\nType: ${mediaType}\n\n_⚡ Powered by Savage Tech_`;
            if (mediaType === "image") {
                await sock.sendMessage(from, { image: buffer, caption: caption });
            } else if (mediaType === "video") {
                await sock.sendMessage(from, { video: buffer, caption: caption });
            }
        } catch (err) {
            console.error("savestatus error:", err);
            await sock.sendMessage(from, { text: `❌ Failed to save status: ${err.message}` });
        }
    }
};
