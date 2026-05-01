#!/bin/bash
declare -A spotify=(
  ["spotifytrack"]="track"
  ["spotifyalbum"]="album"
  ["spotifyartist"]="artist"
  ["spotifyplaylist"]="playlist"
  ["spotifysearch"]="search"
)

for cmd in "${!spotify[@]}"; do
  endpoint="${spotify[$cmd]}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'CMD_NAME',
  category: 'Audio',
  description: 'Get Spotify metadata (track, album, artist, playlist)',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <spotify_url_or_search_term>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      let apiUrl;
      if (query.match(/spotify\.com/)) {
        // If user gives a full Spotify URL, extract ID? Better to pass URL directly
        apiUrl = `https://apis.xwolf.space/api/spotify/${endpoint}?url=${encodeURIComponent(query)}`;
      } else {
        // Search mode
        apiUrl = `https://apis.xwolf.space/api/spotify/${endpoint}?q=${encodeURIComponent(query)}`;
      }
      const response = await axios.get(apiUrl, { httpsAgent });
      let resultText = `🎵 *Spotify ${cmd.toUpperCase()}*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      if (response.data.success) {
        const data = response.data.result || response.data;
        resultText += JSON.stringify(data, null, 2);
      } else {
        resultText += `❌ Error: ${response.data.error || 'Not found'}`;
      }
      await sock.sendMessage(msg.key.remoteJid, { text: resultText.slice(0, 2000), mentions: mention });
    } catch (err) {
      console.error(`CMD_NAME error:`, err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${err.message}` });
    }
  }
};
ENDJS
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js (Spotify text info)"
done
echo "Spotify commands regenerated as text-only."
