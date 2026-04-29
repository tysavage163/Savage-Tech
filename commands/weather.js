const axios = require('axios');

module.exports = {
    name: 'weather',
    category: 'tools',
    description: 'Get current weather for a city (no API key needed)',
    async execute(sock, msg, args) {
        const city = args.join(' ');
        if (!city) {
            return sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: .weather London' });
        }

        try {
            // Use wttr.in with ?format to get clean text
            const url = `https://wttr.in/${encodeURIComponent(city)}?format=%l:+%c+%t,+%w,+%h,+%p`;
            const res = await axios.get(url, { timeout: 10000 });
            const data = res.data.trim();
            
            if (data.includes('Unknown location')) {
                return sock.sendMessage(msg.key.remoteJid, { text: '❌ City not found.' });
            }
            
            const text = `🌤️ *Weather Info*\n${data}`;
            await sock.sendMessage(msg.key.remoteJid, { text });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Weather service error. Try again later.' });
        }
    }
};
