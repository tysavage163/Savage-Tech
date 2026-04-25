// ss.js
// Takes a screenshot of a website

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Provide a URL (e.g. .ss google.com)')
    
    m.reply('📸 Capturing site... please wait.')
    let ssUrl = `https://api.screenshotmachine.com?key=free&url=${encodeURIComponent(text)}&dimension=1024x768`
    
    try {
        await conn.sendFile(m.chat, ssUrl, 'screenshot.png', `🌐 Preview for: ${text}`, m)
    } catch (e) {
        m.reply('Failed to capture screenshot. Link might be dead.')
    }
}

handler.command = ['ss', 'screenshot']
module.exports = handler
