module.exports = {
    name: 'pair',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        const pairMsg = `
╔════◇ 【 **SΛVΛGΞ PΛIЯIПG** 】 ◇════╗
║
┣┫ 🌐 **SITE:** https://savage-pair.onrender.com
┣┫ ⚡ **METHOD:** Linking Code
║
┣━━◇ 【 **VΣЯDICƬ** 】 ◇━━┫
║
┣┫ *Stop struggling with legacy*
┣┫ *connection methods. Use the*
┣┫ *interface to bridge the gap.*
┣┫ 
┣┫ *Master the link...*
┣┫ *...or remain disconnected.*
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

        await sock.sendMessage(from, { 
            text: pairMsg,
            contextInfo: {
                externalAdReply: {
                    title: "SΛVΛGΞ-TECH PΛIЯIПG",
                    body: "Connect to the Engine",
                    sourceUrl: "https://savage-pair.onrender.com",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};
