module.exports = {
    name: "antileave",
    category: "group",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "❌ Group only command."
            });
        }

        const sender = msg.key.participant || msg.key.remoteJid;

        // ===== ADMIN CHECK =====
        let isAdmin = false;

        try {
            const meta = await sock.groupMetadata(from);

            const participant = meta.participants.find(
                p => p.id === sender || p.jid === sender
            );

            isAdmin =
                participant?.admin === "admin" ||
                participant?.admin === "superadmin";

        } catch {}

        const isOwner = global.owner?.includes(sender);

        if (!isAdmin && !isOwner && !isArchitect && !isMe) {
            return sock.sendMessage(from, {
                text: "🔒 Admins only command."
            });
        }

        // ===== STATE INIT =====
        if (!global.antiLeave) global.antiLeave = {};

        // ===== TOGGLE =====
        global.antiLeave[from] = !global.antiLeave[from];

        const status = global.antiLeave[from];

        const quotesOn = [
            "Exit attempts detected… system locked.",
            "Leaving is not an option anymore.",
            "Savage Tech holds the gate shut.",
            "Once inside, you don’t walk out freely.",
            "The system now rejects exit commands."
        ];

        const quotesOff = [
            "Exit protection disabled.",
            "Bot is now free to leave if needed.",
            "System guard released.",
            "Anti-leave protocol turned off.",
            "Freedom mode restored."
        ];

        const quote = (status ? quotesOn : quotesOff)[
            Math.floor(Math.random() * (status ? quotesOn.length : quotesOff.length))
        ];

        await sock.sendMessage(from, {
            text:
`🛡️ *ANTI-LEAVE SYSTEM*

📌 Status: ${status ? "ENABLED" : "DISABLED"}

🧊 ${quote}

⚡ Powered by Savage Tech`
        });
    }
};
