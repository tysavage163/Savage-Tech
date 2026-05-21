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
      console.log('TV Search API response:', JSON.stringify(res.data, null, 2));

      if (!res.data.success) {
        return sock.sendMessage(from, { text: `❌ Search failed: ${res.data.error || 'Unknown error'}` });
      }

      // Try different possible result fields
      let shows = res.data.result || res.data.results || res.data.data || [];
      if (!Array.isArray(shows) || shows.length === 0) {
        return sock.sendMessage(from, { text: '❌ No results found.' });
      }

      shows = shows.slice(0, 5);
      let text = '📺 *TV SHOW SEARCH RESULTS*\n\n';
      for (const s of shows) {
        const name = s.name || s.title || '?';
        const year = (s.premiered || s.first_air_date || '').split('-')[0] || 'N/A';
        const rating = s.rating?.average || s.vote_average || 'N/A';
        const status = s.status || 'N/A';
        const genres = (s.genres || []).join(', ') || '-';
        text += `🔹 *${name}* (${year})\n   ⭐ Rating: ${rating}\n   📺 Status: ${status}\n   🎭 Genres: ${genres}\n\n`;
      }
      text += `🔍 Use .tvshowinfo <id> for details (ID shown in the API response). To get ID, check the console output or use the show's TVMaze ID.`;

      // Try to get image from first result
      let imageBuffer = null;
      const first = shows[0];
      const poster = first?.image?.medium || first?.poster_path;
      if (poster) {
        try {
          const imgRes = await axios.get(poster, { responseType: 'arraybuffer' });
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
