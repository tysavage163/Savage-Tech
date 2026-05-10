module.exports = {
    name: "leave",
    category: "owner",

    async execute(sock, msg, args, { isMe, isArchitect }) {

        const from = msg.key.remoteJid;

        // must be a group
        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "❌ This command only works in groups."
            });
        }

        // OWNER CHECK (critical fix)
        if (!isMe && !isArchitect) {
            return sock.sendMessage(from, {
                text: "🔒 Owner only command."
            });
        }

        const exits = [
            "👋 I was never part of this chaos... leaving now.",
            "💀 Group quality detected: insufficient. Exiting.",
            "🚪 I outgrew this place. Goodbye.",
            "⚡ Savage Tech disconnecting... stay average.",
            "🧊 Silence restored. I'm out.",
            "🔥 This group doesn’t meet standards. Leaving.",
            "🕶️ I came, I saw, I left disappointed.",
            "🚫 No purpose detected here. Exit initiated.",
            "💨 Gone. No trace. No regrets.",
            "⚔️ Even bots need dignity. I'm leaving."
        ];

        const pick =
            exits[Math.floor(Math.random() * exits.length)];

        try {

            await sock.sendMessage(from, {
                text: pick
            });

            setTimeout(async () => {
                await sock.groupLeave(from);
            }, 1200);

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text: "❌ Failed to leave group."
            });
        }
    }
};
