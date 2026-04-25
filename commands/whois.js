async function execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    
    // Simplified target detection
    let target;
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        target = msg.message.extendedTextMessage.contextInfo.participant;
    } else if (args[0]) {
        target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    } else {
        target = msg.key.participant || from;
    }

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
        // This will at least tell us if the command TRIED to run
        console.log("Whois Error: ", e);
        sock.sendMessage(from, { text: '❌ SΛVΛGΞ-TECH Error: Could not fetch data.' }, { quoted: msg });
    }
}

// Ensure the 'name' matches exactly what you type after the dot
module.exports = { 
    name: 'whois', 
    category: 'tools', 
    execute 
};
