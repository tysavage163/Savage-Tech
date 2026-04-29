const { GoogleGenerativeAI } = require("@google/generative-ai");

// Read API key from environment variable (set in Termux)
const API_KEY = process.env.GEMINI_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_KEY environment variable not set. AI commands will not work.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

module.exports = {
    name: 'ai',
    category: 'tools',
    description: 'Chat with Google Gemini AI',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const question = args.join(' ');
        if (!question) {
            return await sock.sendMessage(from, { text: '❌ Usage: .ai What is the meaning of life?' });
        }

        if (!genAI) {
            return await sock.sendMessage(from, { text: '❌ AI service not configured. Contact bot owner.' });
        }

        await sock.sendMessage(from, { text: `🤖 *Thinking...*\n_${question}_` });

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(question);
            const response = result.response.text();

            const clean = response.length > 2000 ? response.substring(0, 1997) + '...' : response;
            const watermark = `\n\n╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: `🤖 *Gemini AI:*\n${clean}${watermark}` });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ AI service error. Try again later.' });
        }
    }
};
