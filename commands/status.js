module.exports = {
    name: 'status',
    category: 'engine',
    async execute(sock, msg, args, { hasAccess }) {
        if (!hasAccess) return;
        const os = require('os');
        const uptime = process.uptime();
        const runtime = new Date(uptime * 1000).toISOString().substr(11, 8);
        const statusText = "*SΛVΛGΞ-TECH STATUS*\n\n📡 **UPLINK:** STABLE\n⏳ **RUNTIME:** " + runtime + "\n⛓️ **SYSTEM:** ABSOLUTE";
        await sock.sendMessage(msg.key.remoteJid, { text: statusText }, { quoted: msg });
    }
};
