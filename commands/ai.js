const axios = require('axios');

module.exports = {
    name: 'ai',
    category: 'tools',
    description: 'Chat with Gemini AI (via free proxy)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const question = args.join(' ');
        if (!question) {
            return await sock.sendMessage(from, { text: '❌ Usage: .ai What is AI?' });
        }

        await sock.sendMessage(from, { text: `🤖 *Thinking...*\n_${question}_` });

        try {
            const apiUrl = `https://apis.xwolf.space/api/ai/gemini?req=${encodeURIComponent(question)}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });
            let reply = response.data?.reply || response.data?.response || response.data?.result || "No response";
            
            if (reply.length > 2000) reply = reply.substring(0, 1997) + '...';
            const watermark = `\n\n╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: `🤖 *Gemini AI:*\n${reply}${watermark}` });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ AI service error. Try again later.' });
        }
    }
};
