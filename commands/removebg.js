// removebg.js – Remove background from an image
const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'removebg',
  category: 'tools',
  description: 'Remove background from image (provide image URL or reply to an image)',
  async execute(sock, msg, args) {
    let imageUrl = args[0];
    
    // If no URL provided, check if replying to an image message
    if (!imageUrl && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      if (quoted.imageMessage) {
        // Download the image from WhatsApp servers (requires media download logic)
        // For simplicity, we'll ask user to provide a public image URL.
        return sock.sendMessage(msg.key.remoteJid, { text: '❓ Please reply with a public image URL. Example: .removebg https://example.com/image.jpg' });
      }
    }

    if (!imageUrl || !imageUrl.match(/^https?:\/\/.+\/(.+)/)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Provide a valid public image URL.\nUsage: .removebg https://example.com/photo.jpg' });
    }

    try {
      // The API might expect a JSON with "image_url" or a FormData. Let's assume JSON.
      const response = await axios.post('https://apis.xwolf.space/api/ai/removebg', { image_url: imageUrl }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === true) {
        const result = response.data.result; // Could be base64 or hosted URL
        if (result && result.startsWith('data:image')) {
          // Send as image buffer (base64)
          const base64Data = result.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: '✅ Background removed.' });
        } else if (result && result.match(/^https?:\/\//)) {
          // Send as link
          await sock.sendMessage(msg.key.remoteJid, { text: `🖼️ Background removed: ${result}` });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Unexpected response format.` });
        }
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ API error: ${response.data.error || 'Remove background failed.'}` });
      }
    } catch (error) {
      console.error('RemoveBG error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Background removal failed. Check URL or API.' });
    }
  }
};
