module.exports = {
    name: "antistatusmention",
    category: "group",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        // ===== GROUP ONLY =====
        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "❌ This command only works in groups."
            });
        }

        // ===== ADMIN CHECK =====
        const meta = await sock.groupMetadata(from);
        const participant = meta.participants.find(p => p.id === sender);

        if (!participant || (participant.admin !== "admin" && participant.admin !== "superadmin")) {
            return sock.sendMessage(from, {
                text: "❌ Only group admins can use this command."
            });
        }

        const action = args[0]?.toLowerCase();

        if (!action || !["on", "off"].includes(action)) {
            return sock.sendMessage(from, {
                text:
`⚙️ *ANTISTATUSMENTION CONTROL*

Usage:
.antistatusmention on
.antistatusmention off`
            });
        }

        // ===== ENABLE / DISABLE =====
        global.antistatusmention[from] = action === "on";

        return sock.sendMessage(from, {
            text:
`✅ *ANTI-STATUSMENTION ${action.toUpperCase()}*

📍 Group protection updated successfully.`
        });
    }
};
