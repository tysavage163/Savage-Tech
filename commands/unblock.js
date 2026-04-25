const handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return;
    let user = m.quoted ? m.quoted.sender : m.mentionedJid[0];
    await conn.updateBlockStatus(user, 'unblock');
    m.reply("🔓 User Whitelisted.");
};
handler.command = ['unblock'];
module.exports = handler;
