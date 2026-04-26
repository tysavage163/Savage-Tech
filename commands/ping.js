module.exports = {
    category: 'engine',
    name: 'ping',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        const start = Date.now();
        const pingMsg = await sock.sendMessage(from, { text: '📡 *Savage-Tech Diagnostic...*' });
        const end = Date.now();
        const latency = end - start;

        // Spencer-Centric Perfection Quotes
        const perfectionLines = [
            "Spencer created me. Perfection is a must.",
            "Engineered by Spencer. Lag is for the weak.",
            "Built for speed, forged by Spencer.",
            "My creator Spencer doesn't do 'average'.",
            "Diagnostic complete: Spencer's perfection detected.",
            "Pure speed. Pure Spencer. Pure perfection.",
            "I respond this fast because Spencer coded me to lead.",
            "Standard check: Flawless. Architect: Spencer."
        ];
        
        const savageLine = perfectionLines[Math.floor(Math.random() * perfectionLines.length)];

        const responseText = `
*───「 PERFORMANCE 」───*
⚡ *Latency:* ${latency}ms
🛰️ *Server:* Stable
🛠️ *Creator:* Beck Spencer

"${savageLine}"`;

        await sock.sendMessage(from, { 
            text: responseText, 
            edit: pingMsg.key 
        }, { quoted: msg });
    }
};
