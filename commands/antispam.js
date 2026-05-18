module.exports = {
    name: 'antispam',
    category: 'group',
    description: 'Manage anti-spam settings (rate limit & duplicates)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) return sock.sendMessage(from, { text: '🔒 Only group admins can manage antispam.' });

        if (!global.antiSpamConfig) global.antiSpamConfig = {};
        if (!global.antiSpamWarnings) global.antiSpamWarnings = {};
        if (!global.antiSpamTrack) global.antiSpamTrack = {};

        if (!global.antiSpamConfig[from]) {
            global.antiSpamConfig[from] = {
                enabled: false,
                action: 'delete',
                warnLimit: 3,
                timeWindow: 3,
                maxMessages: 5,
                duplicateWindow: 2
            };
        }

        const sub = args[0]?.toLowerCase();
        const param = args[1]?.toLowerCase();
        const value = args[2]?.toLowerCase();

        if (sub === 'on') {
            global.antiSpamConfig[from].enabled = true;
            await sock.sendMessage(from, { text: '🛡️ Anti‑spam protection ENABLED.' });
        } else if (sub === 'off') {
            global.antiSpamConfig[from].enabled = false;
            await sock.sendMessage(from, { text: '🛡️ Anti‑spam protection DISABLED.' });
        } else if (sub === 'set' && param) {
            const validActions = ['delete', 'warn', 'kick', 'warn+kick'];
            if (validActions.includes(param)) {
                global.antiSpamConfig[from].action = param;
                await sock.sendMessage(from, { text: `✅ Action set to: ${param.toUpperCase()}` });
            } else {
                await sock.sendMessage(from, { text: '❌ Action must be: delete, warn, kick, or warn+kick' });
            }
        } else if (sub === 'limit') {
            const limit = parseInt(param);
            if (!isNaN(limit) && limit >= 1 && limit <= 10) {
                global.antiSpamConfig[from].warnLimit = limit;
                await sock.sendMessage(from, { text: `✅ Warning limit set to ${limit} before kick (for warn/warn+kick actions).` });
            } else {
                await sock.sendMessage(from, { text: '❌ Limit must be a number between 1 and 10.' });
            }
        } else if (sub === 'window') {
            const seconds = parseInt(param);
            if (!isNaN(seconds) && seconds >= 1 && seconds <= 60) {
                global.antiSpamConfig[from].timeWindow = seconds;
                await sock.sendMessage(from, { text: `✅ Rate‑limit window set to ${seconds} seconds.` });
            } else {
                await sock.sendMessage(from, { text: '❌ Window must be 1–60 seconds.' });
            }
        } else if (sub === 'max') {
            const max = parseInt(param);
            if (!isNaN(max) && max >= 1 && max <= 20) {
                global.antiSpamConfig[from].maxMessages = max;
                await sock.sendMessage(from, { text: `✅ Max messages per window set to ${max}.` });
            } else {
                await sock.sendMessage(from, { text: '❌ Max must be 1–20.' });
            }
        } else if (sub === 'dup') {
            const seconds = parseInt(param);
            if (!isNaN(seconds) && seconds >= 1 && seconds <= 10) {
                global.antiSpamConfig[from].duplicateWindow = seconds;
                await sock.sendMessage(from, { text: `✅ Duplicate message window set to ${seconds} seconds.` });
            } else {
                await sock.sendMessage(from, { text: '❌ Duplicate window must be 1–10 seconds.' });
            }
        } else if (sub === 'list') {
            const cfg = global.antiSpamConfig[from];
            const status = cfg.enabled ? '✅ ENABLED' : '❌ DISABLED';
            await sock.sendMessage(from, {
                text: `🛡️ *ANTI‑SPAM SETTINGS*\nStatus: ${status}\nAction: ${cfg.action}\nWarn Limit: ${cfg.warnLimit}\nTime Window: ${cfg.timeWindow}s\nMax Messages: ${cfg.maxMessages}\nDuplicate Window: ${cfg.duplicateWindow}s`
            });
        } else {
            await sock.sendMessage(from, {
                text: `📖 *Anti‑spam commands:*\n.antispam on/off\n.antispam set (delete|warn|kick|warn+kick)\n.antispam limit <1-10>\n.antispam window <1-60>\n.antispam max <1-20>\n.antispam dup <1-10>\n.antispam list`
            });
        }
    }
};
