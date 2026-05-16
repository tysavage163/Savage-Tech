module.exports = {
    name: "anticall",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = isArchitect || isMe || (global.ownerJid && sender === global.ownerJid);
        const isSudo = global.sudoUsers?.has(sender) || false;
        if (!isOwner && !isSudo) return sock.sendMessage(from, { text: "❌ Command restricted to the owner and sudo users only." });

        if (!global.anticall) global.anticall = {};
        if (global.anticall.mode === undefined) global.anticall.mode = "off";
        if (global.anticall.msg === undefined) global.anticall.msg = "❌ Calls are not accepted. Send a message instead.";

        const sub = args[0]?.toLowerCase();
        const param = args[1]?.toLowerCase();

        if (sub === "mode") {
            if (param === "off" || param === "decline" || param === "block") {
                global.anticall.mode = param;
                await sock.sendMessage(from, { text: `✅ Anti‑call mode set to: ${param.toUpperCase()}` });
            } else {
                await sock.sendMessage(from, { text: "❌ Mode must be: off, decline, or block" });
            }
        } else if (sub === "msg") {
            if (param) {
                global.anticall.msg = args.slice(1).join(" ");
                await sock.sendMessage(from, { text: `✅ Anti‑call message updated.\nNew message: ${global.anticall.msg}` });
            } else {
                await sock.sendMessage(from, { text: `📝 Current anti‑call message:\n${global.anticall.msg}` });
            }
        } else if (sub === "show") {
            await sock.sendMessage(from, { text: `📞 Anti‑call settings:\nMode: ${global.anticall.mode.toUpperCase()}\nMessage: ${global.anticall.msg}` });
        } else if (sub === "test") {
            await sock.sendMessage(from, { text: `🧪 Test message (would be sent to caller):\n${global.anticall.msg}` });
        } else {
            await sock.sendMessage(from, { text: `Usage:\n.anticall mode <off|decline|block>\n.anticall msg <text>\n.anticall show\n.anticall test` });
        }
    }
};
