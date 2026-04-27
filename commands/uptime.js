module.exports = {
    name: "uptime",
    category: "engine",
    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        // Calculate time logic
        const uptimeInSeconds = Math.floor(process.uptime());
        const days = Math.floor(uptimeInSeconds / 86400);
        const hours = Math.floor((uptimeInSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
        const seconds = uptimeInSeconds % 60;

        const runtime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        // Host detection
        const host = process.env.RENDER ? "Render Cloud" : "Termux";

        const statusMessage = `⏳ **UPTIME:** ${runtime}\n` +
                              `📍 **HOST:** ${host}`;

        await sock.sendMessage(from, { text: statusMessage }, { quoted: msg });
    }
};
