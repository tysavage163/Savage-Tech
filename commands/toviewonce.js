const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "toviewonce",
    category: "tools",
    description: "Convert a replied image/video into a view‑once message",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: "❌ Reply to an image or video." });
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
            return sock.sendMessage(from, { text: "❌ Only images and videos can be converted to view‑once." });
        }

        try {
            const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
            if (!buffer) throw new Error("Download failed");

            const sendObj = {
                [mediaType]: buffer,
                viewOnce: true,
                caption: mediaMsg.caption || "View once message"
            };
            await sock.sendMessage(from, sendObj, { quoted: msg });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ Failed to convert: " + err.message });
        }
    }
};
