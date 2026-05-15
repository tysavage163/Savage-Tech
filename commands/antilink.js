module.exports = {
    name: "antilink",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0].split(':')[0];
            const participant = meta.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === senderNumber;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {
            console.error("Admin check error:", e);
        }
        if (!isAdmin) return sock.sendMessage(from, { text: '🔒 Only group admins can manage antilink.' });

        if (!global.antiLinkConfig) global.antiLinkConfig = {};
        if (!global.antiLinkWarnings) global.antiLinkWarnings = {};
        if (global.antiLinkConfig[from] === undefined) {
            global.antiLinkConfig[from] = { enabled: false, action: "delete", warnLimit: 3 };
        }

        const sub = args[0]?.toLowerCase();
        const param = args[1]?.toLowerCase();

        if (sub === "on") {
            global.antiLinkConfig[from].enabled = true;
            await sock.sendMessage(from, { text: '🛡️ Anti‑link protection ENABLED.' });
        } else if (sub === "off") {
            global.antiLinkConfig[from].enabled = false;
            await sock.sendMessage(from, { text: '🛡️ Anti‑link protection DISABLED.' });
        } else if (sub === "set") {
            if (param === "delete" || param === "warn" || param === "kick" || param === "warn+kick") {
                global.antiLinkConfig[from].action = param;
                await sock.sendMessage(from, { text: `✅ Action set to: ${param.toUpperCase()}` });
            } else {
                await sock.sendMessage(from, { text: '❌ Action must be: delete, warn, kick, or warn+kick' });
            }
        } else if (sub === "limit") {
            const limit = parseInt(param);
            if (!isNaN(limit) && limit > 0 && limit <= 10) {
                global.antiLinkConfig[from].warnLimit = limit;
                await sock.sendMessage(from, { text: `✅ Warning limit set to ${limit} before kick.` });
            } else {
                await sock.sendMessage(from, { text: '❌ Limit must be a number between 1 and 10.' });
            }
        } else if (sub === "list") {
            const cfg = global.antiLinkConfig[from];
            await sock.sendMessage(from, { text: `📋 *Anti‑link settings*:\nEnabled: ${cfg.enabled}\nAction: ${cfg.action}\nWarn limit: ${cfg.warnLimit}` });
        } else {
            await sock.sendMessage(from, { text: `Usage:\n.antilink on/off\n.antilink set (delete|warn|kick|warn+kick)\n.antilink limit <1-10>\n.antilink list` });
        }
    }
};
