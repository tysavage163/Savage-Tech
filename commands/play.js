const axios = require('axios');
const https = require('https');

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^/?]+)/,
    /youtube\.com\/v\/([^/?]+)/
  ];
  for (let pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function searchSong(query) {
  try {
    const url = `https://apis.xwolf.space/api/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    if (res.data.success && res.data.result && res.data.result.length) {
      let firstResult = res.data.result[0];
      if (firstResult.url) return firstResult.url;
      if (firstResult.link) return firstResult.link;
      if (firstResult.videoId) return `https://youtu.be/${firstResult.videoId}`;
    }
    return null;
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}

module.exports = {
  name: 'play',
  category: 'audio',
  description: 'Download audio with thumbnail & user mention',
  async execute(sock, msg, args) {
    const input = args.join(' ');
    if (!input) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play <YouTube URL or song name>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mentionedJid = [senderJid];

    let videoUrl = input;
    let videoId = null;

    if (input.includes('youtube.com') || input.includes('youtu.be')) {
      videoId = extractVideoId(input);
      if (!videoId) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Invalid YouTube URL.' });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching for "${input}"...` });
      const foundUrl = await searchSong(input);
      if (!foundUrl) return sock.sendMessage(msg.key.remoteJid, { text: `❌ Could not find a video for "${input}".` });
      videoUrl = foundUrl;
      videoId = extractVideoId(videoUrl);
      if (!videoId) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Found URL but cannot extract video ID.' });
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    try {
      let thumbnailBuffer;
      try {
        thumbnailBuffer = await downloadFile(thumbnailUrl);
      } catch (e) {
        console.warn('Thumbnail download failed');
        thumbnailBuffer = null;
      }

      const apiUrl = `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) throw new Error(res.data.error || 'No download URL');

      let audioUrl = res.data.downloadUrl || res.data.result || res.data.url;
      if (!audioUrl) throw new Error('No audio link from API');

      const audioBuffer = await downloadFile(audioUrl);

      const captionText = `SΛVΛGΞ-TECH AUDIO ☢\n━━━━━━━━━━━━━━━━━━━━\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY: SAVAGE-CORE`;

      if (thumbnailBuffer) {
        await sock.sendMessage(msg.key.remoteJid, {
          image: thumbnailBuffer,
          caption: captionText,
          mentions: mentionedJid
        });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: captionText,
          mentions: mentionedJid
        });
      }

      if (audioBuffer.length > 16 * 1024 * 1024) {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Audio too large. Direct link: ${audioUrl}` });
        return;
      }

      await sock.sendMessage(msg.key.remoteJid, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      });
    } catch (error) {
      console.error('Play command error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to process request.\n${error.message}` });
    }
  }
};
