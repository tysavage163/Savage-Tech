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
      const data = res.data;

      if (!data.success || !data.results || data.results.length === 0) {
        return sock.sendMessage(from, { text: `❌ No results found: ${data.error || 'Unknown error'}` });
      }

      const shows = data.results.slice(0, 5);
      let text = '📺 *TV SHOW SEARCH RESULTS*\n\n';
      for (const s of shows) {
        const year = s.premiered ? s.premiered.split('-')[0] : 'N/A';
        const rating = s.rating !== null && s.rating !== undefined ? s.rating : 'N/A';
        const genres = s.genres && s.genres.length ? s.genres.join(', ') : '-';
        text += `🔹 *${s.name}* (${year})\n   ⭐ Rating: ${rating}\n   📺 Status: ${s.status}\n   🎭 Genres: ${genres}\n\n`;
      }
      text += `🔍 Use .tvshowinfo <id> for details (ID shown in the API response). To get ID, use the show's TVMaze ID – for Breaking Bad it's 169.`;

      // Send poster from first result
      let imageBuffer = null;
      const first = shows[0];
      if (first.image && first.image.medium) {
        try {
          const imgRes = await axios.get(first.image.medium, { responseType: 'arraybuffer' });
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
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Search failed due to network error.' });
    }
  }
};
