let handler = async (m, { conn, text }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png')
    let { status } = await conn.fetchStatus(who).catch(_ => ({ status: 'Private' }))
    
    let caption = `┏━━━〔 ЦƧΣЯ IПFӨ 〕━━━┓\n┃ 👤 @${who.split`@` [0]}\n┃ 📝 BIӨ: ${status}\n┃ © SΛVΛGΞ-TECH\n┗━━━━━━━━━━━━━━┛`
    await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions: [who] }, { quoted: m })
}
handler.help = ['whois']
handler.tags = ['tools']
handler.command = ['whois', 'fetch']

module.exports = handler
