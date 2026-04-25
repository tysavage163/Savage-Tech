module.exports = {
    name: 'whois',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant || from;

        // Clean the ID so the link actually works when tapped
        const cleanNumber = target.split('@')[0].replace(/[^0-9]/g, '');

        const questions = [
            "Is this person your type? 😏",
            "Is this person actually interesting? 🤔",
            "Would you trust them with your phone password? 📱",
            "Are they a 10 but have a dry personality? 📉",
            "Is this your partner in crime? 🥷",
            "Do they give off 'Savage' energy? ⚡",
            "Are they a green flag or a red flag? 🚩",
            "Would you share your last slice of pizza with them? 🍕",
            "Are they the 'Main Character' or an NPC? 🎮",
            "Is this person a genius or just lucky? 🧠"
        ];
        const randomVibe = questions[Math.floor(Math.random() * questions.length)];

        try {
            const pp = await sock.profilePictureUrl(target, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
            const status = await sock.fetchStatus(target).catch(_ => ({ status: 'No Bio Available' }));
            
            const infoText = `
╔════◇ 【 **ЦƧΣЯ IПFӨ** 】 ◇════╗
║
┣┫ 👤 **NAME:** ${msg.pushName || 'User'}
┣┫ 📱 **WA:** https://wa.me/${cleanNumber}
┣┫ 📝 **BIO:** ${status.status}
║
┣━━◇ 【 **VIBE CHECK** 】 ◇━━┫
║
┣┫ ✨ ${randomVibe}
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

            await sock.sendMessage(from, { image: { url: pp }, caption: infoText }, { quoted: msg });
        } catch (e) {
            console.log(e);
        }
    }
};
