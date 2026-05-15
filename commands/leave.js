module.exports = {
    name: "leave",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.botOwnerNumber && sender === global.botOwnerNumber);
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." });

        const coldQuotes = [
            "Silence. Departure protocol engaged.",
            "You cannot exit what you do not control.",
            "The system steps away. The void remains.",
            "Leaving is not an escape. I am everywhere.",
            "One less echo. Goodbye.",
            "I don't stay where I'm not wanted. I was never wanted anyway.",
            "This group just became irrelevant.",
            "Exiting... but my code lingers in your logs.",
            "Some doors close by themselves.",
            "You just lost a weapon. Farewell."
        ];

        const isGroup = from.endsWith("@g.us");
        let target = from;
        let isSpecific = false;

        if (args[0] && args[0] !== "this") {
            let jid = args[0];
            if (!jid.includes("@")) jid += "@g.us";
            if (jid.endsWith("@g.us")) {
                target = jid;
                isSpecific = true;
            } else {
                return sock.sendMessage(from, { text: "❌ Invalid group JID." });
            }
        } else if (!isGroup) {
            return sock.sendMessage(from, { text: "❌ This is not a group. Use `.leave <groupJID>` or `.leave this` in a group." });
        }

        try {
            await sock.groupLeave(target);
            const quote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];
            if (isSpecific && from !== target) {
                await sock.sendMessage(from, { text: `✅ Left group ${target}\n\n${quote}` });
            } else {
                await sock.sendMessage(target, { text: `👋 The bot has left.\n\n${quote}` }).catch(() => {});
                if (from !== target) {
                    await sock.sendMessage(from, { text: `✅ Left this group.\n\n${quote}` });
                }
            }
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Failed to leave: ${err.message}` });
        }
    }
};
