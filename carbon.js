module.exports = {
    name: "carbon",
    category: "tools",
    async execute(sock, msg, args) {
        if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "☣️ *ERROR:* Provide text to generate code image." });
        const code = args.join(" ");
        const url = `https://carbonara.solopov.dev/api/cook`;
        
        // This uses an external API to render the code image
        const axios = require('axios');
        const response = await axios.post(url, { code });
        const buffer = Buffer.from(response.data, 'base64');

        await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: "🛡️ **SΛVΛGΞ-TECH RENDER**" }, { quoted: msg });
    }
};
