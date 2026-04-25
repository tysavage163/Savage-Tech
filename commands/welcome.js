const handler = async (m, { conn, text, isOwner, isAdmin, participants }) => {
    // Command logic for toggling the feature
    if (m.text) {
        if (!isAdmin && !isOwner) return m.reply("❌ Only Admins can toggle the Welcome system.");
        if (!text) return m.reply("Use: .welcome on / .welcome off");

        if (text === 'on') {
            global.db.data.chats[m.chat].welcome = true;
            return m.reply("✅ SΛVΛGΞ Welcome System: *ACTIVATED*");
        } else if (text === 'off') {
            global.db.data.chats[m.chat].welcome = false;
            return m.reply("❌ SΛVΛGΞ Welcome System: *DEACTIVATED*");
        }
    }
};

// This part handles the actual greeting when someone joins
handler.before = async (m, { conn }) => {
    // Only trigger if it's a "new member" update and welcome is ON
    if (m.action === 'add' && global.db.data.chats[m.chat]?.welcome) {
        const metadata = await conn.groupMetadata(m.chat);
        const groupIcon = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png');
        
        for (let user of m.participants) {
            let welcomeText = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            welcomeText += `┃  ✨  《 GӨӨD ӨПΣ 》  ✨  ┃\n`;
            welcomeText += `┠━━━━━━━━━━━━━━━━━━━━━━━━━━┨\n`;
            welcomeText += `┃ 👤 UƧΣЯ: @${user.split('@')[0]}\n`;
            welcomeText += `┃ 👋 ЩΣLCӨMΣ ƬӨ ƬHΣ GЯӨЦP\n`;
            welcomeText += `┃ 👥 MΣMΣBΣЯƧ: ${metadata.participants.length}\n`;
            welcomeText += `┃ ©PӨЩΣЯΣD BY SΛVΛGΞ-TECH ⛓️\n`;
            welcomeText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

            await conn.sendMessage(m.chat, { 
                image: { url: groupIcon }, 
                caption: welcomeText,
                mentions: [user] 
            });
        }
    }
};

handler.command = ['welcome'];
handler.group = true;
module.exports = handler;
