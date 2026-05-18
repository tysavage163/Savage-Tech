const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'version',
    category: 'engine',
    description: 'Show bot version based on commit count',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderName = msg.pushName || 'User';

        let commitCount = 0;
        let commitHash = 'unknown';
        let version = '1.0.0';

        try {
            commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim());
            commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
            const minor = Math.floor(commitCount / 10);
            const patch = commitCount % 10;
            version = `1.${minor}.${patch}`;
        } catch (e) {
            try {
                const pkgPath = path.join(__dirname, '..', 'package.json');
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                version = pkg.version;
            } catch (err) {}
        }

        const mention = senderJid;
        const text = `📦 *BOT VERSION*\n\n👤 *Requested by:* @${senderJid.split('@')[0]}\n🔖 *Version:* ${version}\n🔢 *Total Updates:* ${commitCount}\n🔀 *Commit:* ${commitHash}\n\n_⚡ Savage-Tech OS_`;

        await sock.sendMessage(from, { text, mentions: [mention] }, { quoted: msg });
    }
};
