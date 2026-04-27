module.exports = {
    name: "ping",
    category: "utility",
    async execute(sock, msg) {
        const start = Date.now();
        
        // Industrial Quote Database
        const quotes = [
            "☢️ Progress requires sacrifice.",
            "⚙️ The machine does not feel, but it always remembers.",
            "☣️ Safety is a secondary protocol.",
            "⛓️ Innovation is the only escape.",
            "💀 Master your tools or be deleted.",
            "🔋 System heart-beat detected."
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // First message to initiate the scan
        await sock.sendMessage(msg.key.remoteJid, { text: "🚀 *SΛVΛGΞ:* Scanning signal..." });
        
        const end = Date.now();
        const latency = end - start;

        // Final response with the quote and speed
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `🛰️ **PONG:** ${latency}ms\n\n_${randomQuote}_` 
        }, { quoted: msg });
    }
};
