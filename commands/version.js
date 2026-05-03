const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'version',
    category: 'engine',
    description: 'Show bot version and latest Git commit',
    async execute(sock, msg, args) {
        const sender = msg.pushName || 'User';
        const jid = msg.key.participant || msg.key.remoteJid;
        let version = 'unknown';
        let commit = 'unknown';
        try {
            const pkgPath = path.join(__dirname, '..', 'package.json');
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            version = pkg.version;
        } catch (e) {}
        try {
            commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
        } catch (e) {}
        const text = `📦 *BOT VERSION*\n👤 REQUESTED BY: @${sender}\n━━━━━━━━━━━━━━━━━━━━\n🔖 Version: ${version}\n🔀 Commit: ${commit}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;
        await sock.sendMessage(msg.key.remoteJid, { text, mentions: [jid] });
    }
};
