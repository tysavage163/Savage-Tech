module.exports = {
    name: "leave",
    category: "owner",

    async execute(sock, msg) {

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "❌ This command only works in groups."
            });
        }

        // OWNER IDENTIFICATION (same logic as index.js)
        const botId = sock.user?.id
            ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
            : null;

        const isMe = msg.key.fromMe;
        const isArchitect = isMe || (botId && sender === botId);

        // 🔒 RUTHLESS DENIAL BLOCK
        if (!isArchitect) {

            const rejects = [
                "🚫 Access denied. You are not authorized to command me.",
                "⚠️ Nice try. But authority was never yours to use.",
                "🧠 System verdict: Unauthorized user detected.",
                "🔒 You don’t control me. Stay in your lane.",
                "💀 Permission denied. This bot obeys its creator only.",
                "🚷 You lack clearance for this operation.",
                "⚡ Attempt logged. Authority mismatch confirmed.",
                "🧊 You are not the operator of this system.",
                "⛔ Command rejected. Ownership not recognized.",
                "🛑 You cannot exit what you do not control."
            ];

            const pick =
                rejects[Math.floor(Math.random() * rejects.length)];

            return sock.sendMessage(from, {
                text: pick
            });
        }

        // 🔥 OWNER EXIT MESSAGES
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

        const pick = exits[Math.floor(Math.random() * exits.length)];

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
