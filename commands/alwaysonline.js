module.exports = {
    name: "alwaysonline",
    category: "owner",
    description: "Toggle bot to always show online status",
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        if (!isArchitect) {
            return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: msg });
        }

        if (args[0] && (args[0].toLowerCase() === "on" || args[0].toLowerCase() === "off")) {
            global.alwaysOnline = args[0].toLowerCase() === "on";
        } else {
            global.alwaysOnline = !global.alwaysOnline;
        }
        const status = global.alwaysOnline ? "enabled" : "disabled";
        await sock.sendMessage(from, { text: `✅ Always Online ${status}.` }, { quoted: msg });
    }
};
