module.exports = {
    name: "antibadword",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ Group only command." });

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) return sock.sendMessage(from, { text: "🔒 Only group admins can manage antibadword." });

        if (!global.badWords) global.badWords = {};
        if (!global.badWordWarnings) global.badWordWarnings = {};
        if (!global.badWordConfig) global.badWordConfig = {};
        if (global.badWords[from] === undefined) global.badWords[from] = new Set();
        if (global.badWordConfig[from] === undefined) {
            global.badWordConfig[from] = { action: "delete", warnLimit: 3 };
        }

        const sub = args[0]?.toLowerCase();
        const param = args[1]?.toLowerCase();
        const value = args[2]?.toLowerCase();

        if (sub === "add" && param) {
            global.badWords[from].add(param);
            await sock.sendMessage(from, { text: `✅ Added "${param}" to bad words list.` });
        } else if (sub === "remove" && param) {
            if (global.badWords[from].has(param)) {
                global.badWords[from].delete(param);
                await sock.sendMessage(from, { text: `✅ Removed "${param}" from bad words list.` });
            } else {
                await sock.sendMessage(from, { text: `❌ "${param}" not in bad words list.` });
            }
        } else if (sub === "list") {
            const list = Array.from(global.badWords[from]);
            if (list.length === 0) {
                await sock.sendMessage(from, { text: "📋 No bad words added yet." });
            } else {
                await sock.sendMessage(from, { text: `📋 *Bad words*:\n${list.map(w => `• ${w}`).join("\n")}` });
            }
        } else if (sub === "set") {
            if (param === "delete" || param === "warn" || param === "kick" || param === "warn+kick") {
                global.badWordConfig[from].action = param;
                await sock.sendMessage(from, { text: `✅ Action set to: ${param.toUpperCase()}` });
            } else {
                await sock.sendMessage(from, { text: "❌ Action must be: delete, warn, kick, or warn+kick" });
            }
        } else if (sub === "limit") {
            const limit = parseInt(param);
            if (!isNaN(limit) && limit > 0 && limit <= 10) {
                global.badWordConfig[from].warnLimit = limit;
                await sock.sendMessage(from, { text: `✅ Warning limit set to ${limit} before kick.` });
            } else {
                await sock.sendMessage(from, { text: "❌ Limit must be a number between 1 and 10." });
            }
        } else if (sub === "on") {
            if (!global.badWordEnabled) global.badWordEnabled = {};
            global.badWordEnabled[from] = true;
            await sock.sendMessage(from, { text: "🛡️ Anti‑bad word protection ENABLED." });
        } else if (sub === "off") {
            if (!global.badWordEnabled) global.badWordEnabled = {};
            global.badWordEnabled[from] = false;
            await sock.sendMessage(from, { text: "🛡️ Anti‑bad word protection DISABLED." });
        } else {
            await sock.sendMessage(from, { text: "Usage:\n.antibadword add <word>\n.antibadword remove <word>\n.antibadword list\n.antibadword on/off\n.antibadword set (delete|warn|kick|warn+kick)\n.antibadword limit <1-10>" });
        }
    }
};
