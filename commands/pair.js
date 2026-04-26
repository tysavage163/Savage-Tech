module.exports = {
    category: 'engine',
    name: 'pair',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // The image link you provided
        const pairImg = "https://i.ibb.co/5WJmsXjT/abedeb26fb62e27cd2fbb1292134ea1c.webp";

        const surgicalFrame = `
« ꜱᴀᴠᴀɢᴇ-ᴛᴇᴄʜ // ᴄᴏʀᴇ-ɪɴɪᴛ »
┌────────────────────────┐
  ID: Q-CORE.0x992
  LINK: spencers-quantam-core
  PATH: /establish/bridge
└────────────────────────┘
 [ ▓▓▓▓▓▓▓▓▓▓▓▓ ] 100%
 
🔗 https://spencers-quantam-core.onrender.com
*Master the tools or be deleted.*`;

        await sock.sendMessage(from, { 
            text: surgicalFrame,
            contextInfo: {
                externalAdReply: {
                    title: "SΛVΛGΞ: QUANTUM CORE",
                    body: "Protocol: 0x992 Establish",
                    sourceUrl: "https://spencers-quantam-core.onrender.com",
                    mediaType: 1,
                    thumbnailUrl: pairImg, // Direct thumbnail link
                    renderLargerThumbnail: true,
                    showAdAttribution: true // Adds a "sponsored" or "bot" vibe
                }
            }
        }, { quoted: msg });
    }
};
