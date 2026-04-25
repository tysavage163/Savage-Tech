// tagall.js
// Tags every member in a group

const handler = async (m, { conn, participants, isOwner, isAdmin }) => {
    if (!(isAdmin || isOwner)) return m.reply('❌ This is for Admins only.')
    
    let text = `📢 *SΛVΛGΞ-TECH ANNOUNCEMENT*\n\n`
    for (let mem of participants) {
        text += `⛓️ @${mem.id.split('@')[0]}\n`
    }
    
    conn.sendMessage(m.chat, { text: text, mentions: participants.map(a => a.id) }, { quoted: m })
}

handler.command = ['tagall', 'everyone']
handler.group = true
module.exports = handler
