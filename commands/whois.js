const handler = async (m, { conn, text }) => {
    let target = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target || target.length < 10) return m.reply('Tag someone, reply to a message, or type their number.');

    try {
        // Fetches profile picture or uses a default Savage image if none
        let pp = await conn.profilePictureUrl(target, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
        let status = await conn.fetchStatus(target).catch(_ => ({ status: 'Status Private' }));
        let bio = status.status || 'No Bio Found';
        
        let whoisText = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        whoisText += `┃  👤  《 ЦƧΣЯ IПFӨ 》  👤  ┃\n`;
        whoisText += `┠━━━━━━━━━━━━━━━━━━━━━━━━━━┨\n`;
        whoisText += `┃ 📱 ПЦMBΣЯ: wa.me/${target.split('@')[0]}\n`;
        whoisText += `┃ 📝 BIӨ: ${bio}\n`;
        whoisText += `┃ 🔗 ᄂIПK: https://wa.me/${target.split('@')[0]}\n`;
        whoisText += `┃ ©PӨЩΣЯΣD BY SΛVΛGΞ-TECH ⛓️\n`;
        whoisText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await conn.sendMessage(m.chat, { image: { url: pp }, caption: whoisText }, { quoted: m });
    } catch (e) {
        m.reply('Error: Could not retrieve user identity.');
    }
};

handler.command = ['whois', 'fetchuser', 'userinfo'];
module.exports = handler;
