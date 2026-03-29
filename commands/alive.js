module.exports = {
    name: 'alive',
    async execute(sock, m, args) {
        // SAVAGE AURA QUOTES - Handpicked for Undivided Attention
        const savageQuotes = [
            "“I don’t compete for a spot. I am the spot.”",
            "“Move in silence. Only speak when it’s time to say Checkmate.”",
            "“They whispered to her, 'You cannot withstand the storm.' She whispered back, 'I am the storm.'”",
            "“Don’t mistake my silence for weakness. No one plans a murder out loud.”",
            "“Be a shark. Sharks never stop moving, even when they sleep.”",
            "“If you want to reach the top, you have to be okay with being misunderstood by those at the bottom.”",
            "“I’m not heartless. I’ve just learned to use my heart less.”",
            "“History is written by the victors. I’m currently holding the pen.”",
            "“ Lions don't lose sleep over the opinion of sheep.”",
            "“Obsession is what the lazy call dedication.”"
        ];

        // Logic to pick a quote and get current time
        const quote = savageQuotes[Math.floor(Math.random() * savageQuotes.length)];
        const time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
        const date = new Date().toLocaleDateString();

        // High-End Flashy Formatting
        const statusHeader = `┏━━━〔 *SAVAGE-TECH V1* 〕━━━┓\n┃ ⚡ *SYSTEM STATUS:* ONLINE\n┗━━━━━━━━━━━━━━━━━━━━┛`;
        
        const mainBody = `\n🔥 *AURA CHECK:* \n_${quote}_\n\n` +
                         `👤 *COMMANDER:* Beck Spencer\n` +
                         `📅 *DATE:* ${date}\n` +
                         `🕒 *TIME:* ${time}\n` +
                         `🛰️ *NETWORK:* Stable\n` +
                         `🛠️ *PREFIX:* !\n\n` +
                         `> *“The world is yours, if you’re savage enough to take it.”*`;

        await sock.sendMessage(m.key.remoteJid, { 
            text: statusHeader + mainBody,
            contextInfo: {
                externalAdReply: {
                    title: "SAVAGE-TECH : UNDIVIDED ATTENTION",
                    body: "Version 1.0.5 | Secure Connection",
                    // You can put a high-res image link here
                    thumbnailUrl: "https://i.ibb.co/vz6mD8p/savage.jpg", 
                    sourceUrl: "https://github.com/Savage-Tech",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
