async function execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    if (!target || target.length < 10) return sock.sendMessage(from, { text: 'Tag a user or reply to a message.' }, { quoted: msg });

    try {
        const pp = await sock.profilePictureUrl(target, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
        const status = await sock.fetchStatus(target).catch(_ => ({ status: 'Private' }));
        
        let infoText = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        infoText += `┃  👤  《 ЦƧΣЯ IПFӨ 》  👤  ┃\n`;
        infoText += `┠━━━━━━━━━━━━━━━━━━━━━━━━━━┨\n`;
        infoText += `┃ 📱 ПЦMBΣЯ: wa.me/${target.split('@')[0]}\n`;
        infoText += `┃ 📝 BIӨ: ${status.status || 'No Bio'}\n`;
        infoText += `┃ ©PӨЩΣЯΣD BY SΛVΛGΞ-TECH ⛓️\n`;
        infoText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { image: { url: pp }, caption: infoText }, { quoted: msg });
    } catch (e) {
        sock.sendMessage(from, { text: 'Error fetching user data.' }, { quoted: msg });
    }
}

module.exports = { name: 'whois', category: 'tools', execute };
