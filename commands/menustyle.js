module.exports = {
    name: 'menustyle',
    category: 'engine',
    description: 'Change menu display style',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const style = args[0]?.toLowerCase();
        const validStyles = ['original', 'dim', 'minimal', 'compact', 'bullet', 'mono', 'boldhead', 'noicon'];
        if (!style || !validStyles.includes(style)) {
            return sock.sendMessage(from, { text: `❌ Usage: .menustyle <style>\n\nAvailable: ${validStyles.join(', ')}` }, { quoted: msg });
        }
        global.menuStyle = style;
        await sock.sendMessage(from, { text: `✅ Menu style set to: *${style}*` }, { quoted: msg });
    }
};
