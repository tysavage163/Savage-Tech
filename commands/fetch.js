const axios = require('axios');

module.exports = {
    name: "fetch",
    category: "tools",
    async execute(sock, msg, args) {
        if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "☣️ Provide a URL." });
        
        try {
            const response = await axios.get(args[0]);
            const data = JSON.stringify(response.data, null, 2).slice(0, 1000);
            await sock.sendMessage(msg.key.remoteJid, { text: `📡 **DATA FETCHED:**\n\n\`\`\`${data}\`\`\`` });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ **FETCH FAILED:** ${e.message}` });
        }
    }
};
