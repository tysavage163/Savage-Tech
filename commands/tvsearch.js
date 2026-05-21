const axios = require('axios');

module.exports = {
  name: 'tvsearch',
  category: 'search menu',
  description: 'Search TV shows by name (TVMaze) with poster',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❌ Usage: .tvsearch <show name>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tvshow/search?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        const shows = res.data.result.slice(0, 5);
        let text = '📺 *TV SHOW SEARCH RESULTS*\n\n';
        for (const s of shows) {
          text += `🔹 *${s.name}* (${s.premiered?.split('-')[0] || 'N/A'})\n`;
          text += `   ⭐ Rating: ${s.rating?.average || 'N/A'}\n`;
          text += `   📺 Status: ${s.status}\n`;
          text += `   🎭 Genres: ${s.genres?.join(', ') || '-'}\n\n`;
        }
        text += `🔍 Use .tvshowinfo <id> for details (ID shown in .tvshowinfo result)`;

        // Send first show's poster if available
        const firstShow = shows[0];
        let imageBuffer = null;
        if (firstShow && firstShow.image && firstShow.image.medium) {
          try {
            const imgRes = await axios.get(firstShow.image.medium, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(imgRes.data);
          } catch (imgErr) {
            console.log('Poster download failed:', imgErr.message);
          }
        }

        if (imageBuffer) {
          await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: text }, { quoted: msg });
        }
      } else {
        await sock.sendMessage(from, { text: `❌ No results: ${res.data.error || 'Not found'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Search failed.' });
    }
  }
};
