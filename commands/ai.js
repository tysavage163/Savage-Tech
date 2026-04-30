require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_KEY not set in .env file.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
// Using stable free-tier model
const MODEL_NAME = "gemini-1.0-pro";

module.exports = {
    name: 'ai',
    category: 'tools',
    description: 'Chat with Google Gemini AI',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const question = args.join(' ');
        if (!question) {
            return await sock.sendMessage(from, { text: '❌ Usage: .ai What is AI?' });
        }
        if (!genAI) {
            return await sock.sendMessage(from, { text: '❌ AI not configured. Contact owner.' });
        }
        await sock.sendMessage(from, { text: `🤖 *Thinking...*\n_${question}_` });
        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(question);
            const response = result.response.text();
            const clean = response.length > 2000 ? response.substring(0,1997)+'...' : response;
            const watermark = `\n\n╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: `🤖 *Gemini AI:*\n${clean}${watermark}` });
        } catch (err) {
            console.error(err);
            let errorMsg = '❌ AI error. Try again later.';
            if (err.message && err.message.includes('404')) {
                errorMsg = '❌ Model not found. Check API key and enable Generative Language API in Google Cloud.';
            } else if (err.message && err.message.includes('API key')) {
                errorMsg = '❌ Invalid API key.';
            }
            await sock.sendMessage(from, { text: errorMsg });
        }
    }
};
