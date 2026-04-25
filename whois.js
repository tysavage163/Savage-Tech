// whois.js
const handler = async (m, { conn, text }) => {
    let target = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (!target) return m.reply('Tag someone or type their number.')

    try {
        let pp = await conn.profilePictureUrl(target, 'image').catch(_ => 'https://i.ibb.co/mC0MB68z/IMG-20260425-WA1076.webp')
        let status = await conn.fetchStatus(target).catch(_ => ({ status: 'Private or Not Found' }))
        let bio = status.status || 'No Bio'
        
        let info = `👤 *SΛVΛGΞ USER INFO*\n\n`
        info += `📱 *Number:* wa.me/${target.split('@')[0]}\n`
        info += `📝 *Bio:* ${bio}\n`
        
        await conn.sendFile(m.chat, pp, 'profile.jpg', info, m)
    } catch (e) {
        m.reply('Error fetching user data.')
    }
}
handler.command = ['whois', 'fetchuser']
module.exports = handler
