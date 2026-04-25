const handler = async (m, { conn, text, isOwner, isAdmin }) => {
    if (m.text) {
        if (!isAdmin && !isOwner) return m.reply("❌ Admin only.");
        if (!text) return m.reply("Use: .goodbye on / .goodbye off");

        if (text === 'on') {
            global.db.data.chats[m.chat].goodbye = true;
            return m.reply("✅ SΛVΛGΞ Goodbye System: *ENABLED*");
        } else if (text === 'off') {
            global.db.data.chats[m.chat].goodbye = false;
            return m.reply("❌ SΛVΛGΞ Goodbye System: *DISABLED*");
        }
    }
};

// Event listener for when a member leaves
handler.before = async (m, { conn }) => {
    if (m.action === 'remove' && global.db.data.chats[m.chat]?.goodbye) {
        const metadata = await conn.groupMetadata(m.chat);
        const groupIcon = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
        
        for (let user of m.participants) {
            let goodbyeText = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            goodbyeText += `┃  💀  《 gσσ∂вyє 》  💀  ┃\n`;
            goodbyeText += `┠━━━━━━━━━━━━━━━━━━━━━━━━━━┨\n`;
            goodbyeText += `┃ ❄️ ЦƧΣЯ: @${user.split('@')[0]}\n`;
            goodbyeText += `┃ 👋 MΣMBΣЯƧ IƧ ᄂΣFƬ ƬHΣ GЯӨЦP\n`;
            goodbyeText += `┃ 👥 MΣMBΣЯƧ: ${metadata.participants.length}\n`;
            goodbyeText += `┃ ©PӨЩΣЯΣD BY SΛVΛGΞ-TECH ⛓️\n`;
            goodbyeText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

            await conn.sendMessage(m.chat, { 
                image: { url: groupIcon }, 
                caption: goodbyeText,
                mentions: [user] 
            });
        }
    }
};

handler.command = ['goodbye'];
handler.group = true;
module.exports = handler;
