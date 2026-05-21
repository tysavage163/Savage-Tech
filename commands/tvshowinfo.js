const axios = require('axios');

module.exports = {
  name: 'tvshowinfo',
  category: 'media',
  description: 'Get full TV show details including cast and episode count by TVMaze ID (use .tvsearch to find ID)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const id = args[0];
    if (!id) return sock.sendMessage(from, { text: '❌ Usage: .tvshowinfo <TVMaze numeric ID>' });
    if (isNaN(id)) return sock.sendMessage(from, { text: '❌ ID must be a number. Use .tvsearch to find the correct numeric ID.' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tvshow/info?id=${id}`);
      const data = res.data;

      if (!data.success || !data.result) {
        return sock.sendMessage(from, { text: `❌ Info failed: ${data.error || 'Show not found. Check ID.'}` });
      }

      const s = data.result;
      let text = `📺 *TV SHOW DETAILS*\n\n`;
      text += `*Name:* ${s.name}\n`;
      text += `*Type:* ${s.type}\n`;
      text += `*Status:* ${s.status}\n`;
      text += `*Premiered:* ${s.premiered || 'N/A'}\n`;
      text += `*Ended:* ${s.ended || 'Still running'}\n`;
      text += `*Runtime:* ${s.runtime || 'N/A'} min\n`;
      text += `*Genres:* ${s.genres?.join(', ') || '-'}\n`;
      text += `*Rating:* ${s.rating !== null && s.rating !== undefined ? s.rating : 'N/A'}\n`;
      text += `*Network:* ${s.network?.name || 'N/A'}\n`;
      if (s.summary) {
        const summary = s.summary.replace(/<[^>]*>/g, '').substring(0, 300);
        text += `*Summary:* ${summary}...\n`;
      }
      text += `\n🔗 *Episodes:* .tvepisodes ${s.id}`;

      let imageBuffer = null;
      const imageUrl = s.image && typeof s.image === 'string' ? s.image : (s.image?.original || null);
      if (imageUrl) {
        try {
          const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
          imageBuffer = Buffer.from(imgRes.data);
        } catch (imgErr) { /* fallback to text only */ }
      }

      if (imageBuffer) {
        await sock.sendMessage(from, { image: imageBuffer, caption: text, mimetype: 'image/jpeg' }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 500) {
        await sock.sendMessage(from, { text: '❌ API error: Invalid ID or the server is temporarily unavailable. Use .tvsearch to find a valid numeric ID.' });
      } else {
        await sock.sendMessage(from, { text: '❌ Network error or API unavailable.' });
      }
    }
  }
};
