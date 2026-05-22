const axios = require('axios');

module.exports = {
    name: 'img2sticker',
    category: 'tools',
    description: 'Convert image to WhatsApp sticker (WebP). Provide image URL.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];
        if (!url) return sock.sendMessage(from, { text: '❌ Usage: .img2sticker <image_url>' }, { quoted: msg });

        try {
            const apiUrl = `https://apis.xwolf.space/api/converter/img-to-sticker?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;
            if (!data.success) throw new Error('Conversion failed');

            const base64Data = data.result.base64Data;
            const base64Content = base64Data.split(',')[1];
            const stickerBuffer = Buffer.from(base64Content, 'base64');

            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ Failed to convert image to sticker.' }, { quoted: msg });
        }
    }
};
