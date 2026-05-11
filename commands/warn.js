// commands/warn.js

global.warns = global.warns || {};

module.exports = {
    name: "warn",
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
                p =>
                    p.id === sender ||
                    p.jid === sender
            );

            isAdmin =
                participant?.admin === "admin" ||
                participant?.admin === "superadmin";

        } catch {}

        if (!isAdmin && !isArchitect && !isMe) {

            return sock.sendMessage(from, {
                text: "🔒 Admins only command."
            });
        }

        // ===== TARGET DETECTION =====

        // mention support
        let mentioned =
            msg.message?.extendedTextMessage
                ?.contextInfo
                ?.mentionedJid?.[0];

        // reply support
        if (!mentioned) {

            mentioned =
                msg.message?.extendedTextMessage
                    ?.contextInfo
                    ?.participant;
        }

        // no target found
        if (!mentioned) {

            return sock.sendMessage(from, {
                text:
`⚠️ Reply to a message or mention a user.

Example:
.warn @user spam

OR

Reply to someone's message:
.warn spam`
            });
        }

        // prevent warning bot owner
        if (global.owner?.includes(mentioned)) {

            return sock.sendMessage(from, {
                text: "⚡ You cannot warn the creator of Savage Tech."
            });
        }

        const reason = args.join(" ") || "No reason provided";

        // ===== WARN STORAGE =====
        if (!global.warns[from]) {
            global.warns[from] = {};
        }

        if (!global.warns[from][mentioned]) {
            global.warns[from][mentioned] = 0;
        }

        global.warns[from][mentioned]++;

        const warns = global.warns[from][mentioned];

        const remaining = 3 - warns;

        // ===== SAVAGE QUOTES =====
        const quotes = [
            "Spencer's patience decreases with every mistake.",
            "Rules exist for a reason. You ignored them.",
            "Another violation added to your record.",
            "Savage Tech sees everything.",
            "You're approaching removal territory.",
            "Discipline is enforced here, not requested.",
            "You were warned. The system remembers.",
            "Chaos is temporary. Enforcement is permanent.",
            "Every action has consequences in this group.",
            "You are testing a system designed to win."
        ];

        const quote =
            quotes[Math.floor(Math.random() * quotes.length)];

        // ===== AUTO KICK =====
        if (warns >= 3) {

            delete global.warns[from][mentioned];

            await sock.sendMessage(from, {
                text:
`☠️ *FINAL WARNING EXCEEDED*

👤 User: @${mentioned.split("@")[0]}
📌 Reason: ${reason}

📊 Warnings: 3/3
🚫 Action: Removal Initiated

🧊 ${quote}

⚡ Powered by Savage Tech`,
                mentions: [mentioned]
            });

            try {

                await sock.groupParticipantsUpdate(
                    from,
                    [mentioned],
                    "remove"
                );

            } catch (err) {

                console.log(err);

                await sock.sendMessage(from, {
                    text: "❌ Failed to remove user."
                });
            }

            return;
        }

        // ===== NORMAL WARN =====
        await sock.sendMessage(from, {
            text:
`⚠️ *WARNING ISSUED*

👤 User: @${mentioned.split("@")[0]}
📌 Reason: ${reason}

📊 Warnings: ${warns}/3
⏳ Remaining Before Kick: ${remaining}

🧊 ${quote}

⚡ Powered by Savage Tech`,
            mentions: [mentioned]
        });
    }
};
