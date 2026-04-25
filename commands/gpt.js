const axios = require('axios');

const handler = async (m, { text, conn }) => {
    if (!text) return m.reply("Ask me anything. \nExample: .gpt How do I code a loop in JS?");
    
    try {
        const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
        const reply = res.data.success;
        await conn.sendMessage(m.chat, { text: `🤖 *SΛVΛGΞ AI:*\n\n${reply}` }, { quoted: m });
    } catch (e) {
        m.reply("AI Core offline. Try again later.");
    }
};

handler.command = ['gpt', 'ask', 'ai'];
module.exports = handler;
