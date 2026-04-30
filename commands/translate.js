// translate.js - Using MyMemory API (Free, no key required)
const axios = require('axios');

module.exports = {
  name: 'translate',
  category: 'tools',
  description: 'Translate text using MyMemory API',
  async execute(sock, msg, args) {
    // Parse arguments: .translate Hello world to es
    let text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .translate Hello world to es' });

    let targetLang = 'en';
    let sourceLang = 'auto';
    let cleanText = text;

    // Check for "to <lang>" at the end
    const toMatch = text.match(/\s+to\s+([a-z]{2})(?:\s|$)/i);
    if (toMatch) {
        targetLang = toMatch[1].toLowerCase();
        cleanText = text.substring(0, toMatch.index).trim();
    }

    try {
        // Using MyMemory API (free, no key)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sourceLang}|${targetLang}`;
        const response = await axios.get(url);
        
        if (response.data && response.data.responseData && response.data.responseData.translatedText) {
            let translated = response.data.responseData.translatedText;
            // MyMemory may contain HTML entities
            translated = translated.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            await sock.sendMessage(msg.key.remoteJid, { text: `🌐 *Translation (${targetLang}):*\n${translated.slice(0, 2000)}` });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Translation service error.' });
        }
    } catch (error) {
        console.error('Translate error:', error);
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Translation failed. Please try again later.' });
    }
  }
};
