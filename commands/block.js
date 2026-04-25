const handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return;
    let user = m.quoted ? m.quoted.sender : m.mentionedJid[0];
    await conn.updateBlockStatus(user, 'block');
    m.reply("🚫 User Blacklisted.");
};
handler.command = ['block'];
module.exports = handler;
