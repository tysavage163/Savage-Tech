module.exports = {
    name: "resetwarn",
    category: "group",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "❌ Group only command."
            });
        }

        const sender = msg.key.participant || msg.key.remoteJid;

        // ===== ADMIN / OWNER CHECK (LOCKED) =====
        let isAdmin = false;

        try {
            const meta = await sock.groupMetadata(from);

            const participant = meta.participants.find(
                p => (p.id === sender || p.jid === sender)
            );

            isAdmin =
                participant?.admin === "admin" ||
                participant?.admin === "superadmin";

        } catch {}

        const isOwner = global.owner?.includes(sender);

        if (!isAdmin && !isOwner && !isArchitect && !isMe) {
            return sock.sendMessage(from, {
                text: "🔒 Only group admins can reset warnings."
            });
        }

        // ===== TARGET (MENTION OR REPLY) =====
        let target =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!target) {
            target =
                msg.message?.extendedTextMessage?.contextInfo?.participant;
        }

        if (!target) {
            return sock.sendMessage(from, {
                text:
`⚠️ Reply to a user or mention them.

Example:
.resetwarn @user

OR reply:
.resetwarn`
            });
        }

        // ===== SAFE STORAGE CHECK =====
        if (!global.warns?.[from]?.[target]) {
            return sock.sendMessage(from, {
                text: "⚠️ This user has no warnings."
            });
        }

        global.warns[from][target] = 0;

        // ===== SAVAGE QUOTES =====
        const quotes = [
            "Even systems deserve mercy once in a while.",
            "Clean slate granted. Don’t waste it.",
            "Order restored. Chaos contained.",
            "Warnings removed. Discipline remains.",
            "Savage Tech remembers everything — but resets when needed.",
            "A reset is not freedom — it’s responsibility.",
            "You’ve been given a second chance. Use it wisely.",
            "The system has forgiven. Don’t test it again.",
            "Past erased. Future monitored.",
            "Even justice has a reset button."
        ];

        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        await sock.sendMessage(from, {
            text:
`🧹 *WARNINGS RESET*

👤 User: @${target.split("@")[0]}
📊 Status: 0/3 warnings
🟢 Clean slate restored

🧊 ${quote}

⚡ Powered by Savage Tech`,
            mentions: [target]
        });
    }
};
