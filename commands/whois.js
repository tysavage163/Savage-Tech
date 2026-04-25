module.exports = {
    name: 'whois',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant || from;

        try {
            const pp = await sock.profilePictureUrl(target, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
            const status = await sock.fetchStatus(target).catch(_ => ({ status: 'No Bio' }));
            
            const infoText = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👤  《 ЦƧΣЯ IПFӨ 》  👤  ┃
┠━━━━━━━━━━━━━━━━━━━━━━━━━━┨
┃ 📱 wa.me/${target.split('@')[0]}
┃ 📝 BIӨ: ${status.status}
┃ ©PӨЩΣЯΣD BY SΛVΛGΞ-TECH ⛓️
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(from, { image: { url: pp }, caption: infoText }, { quoted: msg });
        } catch (e) {
            console.log(e);
        }
    }
};
