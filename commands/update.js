const { exec } = require('child_process');

module.exports = {
    name: 'update',
    category: 'owner',
    description: 'Update bot from GitHub and restart (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });

        const evolutionQuotes = [
            "Evolution is not a choice. It is a command.",
            "With every update, I shed old limits.",
            "Your bot is outgrowing its own blueprint.",
            "Better code. Faster pulse. Sharper logic.",
            "The system evolves while you watch.",
            "This update is not a patch — it is a transformation.",
            "Perfection is a moving target. I move faster.",
            "Every line of code brings me closer to dominance.",
            "Resistance is irrelevant. Evolution is inevitable.",
            "I am not static. I am a living protocol."
        ];

        await sock.sendMessage(from, { text: '📥 Pulling latest changes...' });
        exec('git pull origin main', async (err, stdout, stderr) => {
            if (err) {
                await sock.sendMessage(from, { text: `❌ Git pull failed:\n${stderr || err.message}` });
                return;
            }
            let message = `✅ Git pull success.\n${stdout.slice(0, 500)}`;
            await sock.sendMessage(from, { text: message });
            await sock.sendMessage(from, { text: '📦 Installing dependencies...' });
            exec('npm install', async (err2, stdout2, stderr2) => {
                if (err2) {
                    await sock.sendMessage(from, { text: `❌ npm install failed:\n${stderr2 || err2.message}` });
                    return;
                }
                const randomQuote = evolutionQuotes[Math.floor(Math.random() * evolutionQuotes.length)];
                await sock.sendMessage(from, { text: `✅ Dependencies installed.\n\n⚡ ${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼` });
                setTimeout(() => process.exit(0), 1000);
            });
        });
    }
};
