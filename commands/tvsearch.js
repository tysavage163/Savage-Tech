const axios = require('axios');

module.exports = {
  name: 'tvsearch',
  category: 'media',
  description: 'Search TV shows by name (TVMaze) with poster',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❌ Usage: .tvsearch <show name>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tvshow/search?q=${encodeURIComponent(query)}`);
      const data = res.data;

      if (!data.success || !data.results || data.results.length === 0) {
        return sock.sendMessage(from, { text: '❌ No results found' });
      }

      const shows = data.results.slice(0, 5);
      let text = '📺 *TV SHOW SEARCH RESULTS*\n\n';
      for (const s of shows) {
        const year = s.premiered ? s.premiered.split('-')[0] : 'N/A';
        const rating = s.rating !== null && s.rating !== undefined ? s.rating : 'N/A';
        const genres = s.genres && s.genres.length ? s.genres.join(', ') : '-';
        text += `🔹 *${s.name}* (${year})\n   ⭐ Rating: ${rating}\n   📺 Status: ${s.status}\n   🎭 Genres: ${genres}\n\n`;
      }
      text += `🔍 Use .tvshowinfo <id> for details (e.g., .tvshowinfo 169 for Breaking Bad)`;

      const first = shows[0];
      let imageBuffer = null;
      const imageUrl = first.image && typeof first.image === 'string' ? first.image : (first.image?.medium || null);

      if (imageUrl) {
        try {
          const imgRes = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          imageBuffer = Buffer.from(imgRes.data);
        } catch (imgErr) {}
      }

      if (imageBuffer) {
        await sock.sendMessage(from, {
          image: imageBuffer,
          caption: text,
          mimetype: 'image/jpeg'
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: text }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Search failed due to network error.' });
    }
  }
};
