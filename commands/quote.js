module.exports = {
    name: "quote",
    category: "owner",
    description: "Generate a SΛVΛGΞ-TECH industrial quote",
    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        const quotes = [
            "☢️ Progress requires sacrifice.",
            "⚙️ The machine does not feel, but it always remembers.",
            "☣️ Safety is a secondary protocol.",
            "⛓️ Innovation is the only escape.",
            "💀 Master your tools or be deleted.",
            "🔋 System heart-beat detected.",
            "⚙️ Efficiency is the only law.",
            "🧬 Emotion is a glitch in the biological hardware.",
            "💾 Your limitations are merely unoptimized code.",
            "🛠️ Build. Break. Refine. Repeat.",
            "🌑 The silicon does not sleep.",
            "🧠 Logic is the ultimate weapon.",
            "🩸 Data is the new blood.",
            "⚡ High voltage. High stakes.",
            "👣 Caution: Biological presence detected.",
            "⚠️ Containment is failing. Adaptation is required.",
            "🛑 The perimeter is secured by code, not walls.",
            "📡 Signal noise detected. Purge initiated.",
            "📉 Warning: System stress at 98%.",
            "☢️ Radiation levels rising. Stay in the shadow.",
            "🔌 Do not touch the live wires of innovation.",
            "🛰️ The network is watching.",
            "📂 Privacy is a pre-digital concept.",
            "🌍 Control the data, control the world.",
            "🛡️ SΛVΛGΞ-TECH: Engineering the inevitable."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await sock.sendMessage(from, { 
            text: `⚠️ **SΛVΛGΞ THOUGHT** ⚠️\n\n_"${randomQuote}"_` 
        }, { quoted: msg });
    }
};
