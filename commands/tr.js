const translate = require('@vitalets/google-translate-api');

const handler = async (m, { text, conn }) => {
    if (!text && !m.quoted) return m.reply("Provide text or reply to a message to translate.");
    
    let msg = text ? text : m.quoted.text;
    try {
        let result = await translate(msg, { to: 'en' });
        m.reply(`🌍 *SΛVΛGΞ TRANSLATE*\n\n*Original:* ${msg}\n*Translated:* ${result.text}`);
    } catch (e) {
        m.reply("Translation engine error.");
    }
};

handler.command = ['tr', 'translate'];
module.exports = handler;
