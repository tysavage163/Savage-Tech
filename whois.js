module.exports = {
    name: 'whois',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        // Determine target: Tagged person, sender of the message, or the chat itself
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.key.participant || from;
        
        try {
            // Fetch Profile Picture and Status
            const ppUrl = await sock.profilePictureUrl(target, 'image').catch(() => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
            const status = await sock.fetchStatus(target).catch(() => ({ status: 'No Bio Found' }));
            const pushName = msg.pushName || 'Savage User';

            const info = `
╔════◇ 【 **ЦƧΣЯ IПFӨ** 】 ◇════╗
║
┣┫ 👤 **NAME:** ${pushName}
┣┫ 📋 **BIO:** ${status.status}
┣┫ 🔗 **LINK:** wa.me/${target.split('@')[0]}
║
┣━━◇ 【 **VIBE CHECK** 】 ◇━━┫
║
┣┫ ⚡ Is this person a Savage?
┣┫ ↳ *Check the territory...*
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

            await sock.sendMessage(from, { image: { url: ppUrl }, caption: info }, { quoted: msg });
        } catch (e) {
            console.log("❌ Whois Error:", e);
        }
    }
};
