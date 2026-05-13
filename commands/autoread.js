module.exports = {
    name: "autoread",
    category: "owner",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        // ===== OWNER ONLY =====
        if (!isArchitect && !isMe) {

            const deniedQuotes = [
                "You tried controlling message flow without authority.",
                "Read systems belong to the owner.",
                "Permission denied. The bot ignored your request.",
                "Authority check failed.",
                "You are not allowed to modify core behavior."
            ];

            return sock.sendMessage(from, {
                text:
`❌ *ACCESS DENIED*

🧊 ${deniedQuotes[Math.floor(Math.random() * deniedQuotes.length)]}

⚡ Savage Tech`
            });
        }

        // ===== INIT =====
        if (global.autoRead === undefined) {
            global.autoRead = false;
        }

        // ===== ARG =====
        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(from, {
                text:
`❌ Usage:
.autoread on
.autoread off`
            });
        }

        global.autoRead = option === "on";

        const quotesOn = [
            "Every message will now be seen instantly.",
            "The bot is now watching everything.",
            "No message escapes the system anymore.",
            "Read receipts activated globally.",
            "The eyes are open now."
        ];

        const quotesOff = [
            "Read tracking disabled.",
            "Messages will remain unopened.",
            "The system stopped observing chats.",
            "Auto-read shut down successfully.",
            "The eyes have closed."
        ];

        const quote = global.autoRead
            ? quotesOn[Math.floor(Math.random() * quotesOn.length)]
            : quotesOff[Math.floor(Math.random() * quotesOff.length)];

        await sock.sendMessage(from, {
            text:
`👁️ *AUTO-READ SYSTEM*

📌 Status: ${global.autoRead ? "ENABLED" : "DISABLED"}

🧊 ${quote}

⚡ Powered by Savage Tech`
        });
    }
};
