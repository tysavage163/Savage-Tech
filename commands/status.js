// status.js
// Saves or re-posts status updates

const handler = async (m, { conn, text }) => {
    if (!m.quoted) return m.reply('Reply to a status update to save it.')
    try {
        let buffer = await m.quoted.download()
        await conn.sendFile(m.chat, buffer, 'status.mp4', '✅ SΛVΛGΞ-TECH Status Saved', m)
    } catch (e) {
        m.reply('Error: Could not download media.')
    }
}

handler.command = ['getstatus', 'save']
module.exports = handler
