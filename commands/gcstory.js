module.exports = {
    name: "gcstory",
    category: "group",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        // ===== GROUP ONLY =====
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

        // ===== OWNER BYPASS =====
        if (!isAdmin && !isArchitect && !isMe) {

            const deniedQuotes = [
                "You reached for authority you don't possess.",
                "This command belongs to the admins.",
                "Permission denied. Stay in your lane.",
                "Access rejected. The system knows your rank.",
                "Admins only. Not negotiable."
            ];

            return sock.sendMessage(from, {
                text:
`❌ *ACCESS DENIED*

🧊 ${deniedQuotes[Math.floor(Math.random() * deniedQuotes.length)]}

⚡ Savage Tech`
            });
        }

        // ===== GET TEXT =====
        const text = args.join(" ");

        if (!text) {
            return sock.sendMessage(from, {
                text:
`❌ Usage:
.gcstory your text here

Example:
.gcstory Savage Tech owns the shadows`
            });
        }

        try {

            // ===== FETCH GROUPS =====
            const groups = await sock.groupFetchAllParticipating();

            const groupIds = Object.keys(groups);

            let success = 0;

            // ===== SEND TO ALL GROUPS =====
            for (const groupId of groupIds) {

                try {

                    await sock.sendMessage(groupId, {
                        text:
`📢 *GROUP STORY*

${text}

⚡ Powered by Savage Tech`
                    });

                    success++;

                } catch (err) {}
            }

            // ===== SUCCESS =====
            await sock.sendMessage(from, {
                text:
`✅ *GROUP STORY POSTED*

📡 Sent To: ${success} Groups

🧊 The system has spoken.

⚡ Savage Tech`
            });

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text: "❌ Failed to send group story."
            });
        }
    }
};
