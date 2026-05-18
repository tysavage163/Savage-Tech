const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'dlmp3',
    category: 'audio',
    description: 'Direct MP3 download from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .dlmp3 <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for audio...' }, { quoted: msg });

        try {
            let videoUrl = query;
            if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) {
                    console.log('[DLMP3] No search results for:', query);
                    return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
                }
                videoUrl = searchResults.videos[0].url;
                console.log('[DLMP3] Search result URL:', videoUrl);
            }

            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (!videoId) {
                console.log('[DLMP3] Invalid video ID from URL:', videoUrl);
                return sock.sendMessage(from, { text: '❌ Invalid YouTube URL.' }, { quoted: msg });
            }
            console.log('[DLMP3] Video ID:', videoId);

            const info = await yts({ videoId });
            const title = info.title || 'Unknown Title';
            const duration = info.duration.timestamp || 'Unknown';
            const views = info.views?.toLocaleString() || 'Unknown';
            const author = info.author?.name || 'Unknown';
            const thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎵 *DIRECT MP3*\n♡ *Title:* ${title}\n♡ *Duration:* ${duration}\n♡ *Views:* ${views}\n♡ *Author:* ${author}\n♡ *Status:* Downloading...\n\n_⚡ Powered by Savage-Tech_`
            }, { quoted: msg });

            const endpoint = `https://apis.xwolf.space/download/dLmp3?url=${encodeURIComponent(videoUrl)}`;
            console.log('[DLMP3] Requesting endpoint:', endpoint);
            
            const response = await axios({
                method: 'get',
                url: endpoint,
                timeout: 30000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            console.log('[DLMP3] Response status:', response.status);
            console.log('[DLMP3] Response headers content-type:', response.headers['content-type']);
            console.log('[DLMP3] Response data sample:', JSON.stringify(response.data).slice(0, 500));

            let audioUrl = response.data.downloadUrl || response.data.downloaded_at || response.data.url || response.data.result?.url || response.data.link;
            let audioBuffer = null;

            if (audioUrl) {
                console.log('[DLMP3] Extracted audio URL:', audioUrl);
                const audioRes = await axios({
                    method: 'get',
                    url: audioUrl,
                    responseType: 'arraybuffer',
                    timeout: 90000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                audioBuffer = Buffer.from(audioRes.data);
                console.log('[DLMP3] Downloaded audio size:', audioBuffer.length);
            } else {
                console.log('[DLMP3] No audio URL found in response, trying direct buffer');
                if (response.data && Buffer.isBuffer(response.data)) {
                    audioBuffer = Buffer.from(response.data);
                } else if (response.data && typeof response.data === 'object') {
                    console.log('[DLMP3] Response is JSON, keys:', Object.keys(response.data));
                }
            }

            if (!audioBuffer || audioBuffer.length < 50000) {
                console.log('[DLMP3] Invalid audio buffer size:', audioBuffer ? audioBuffer.length : 0);
                return sock.sendMessage(from, { text: `❌ No audio data received (size: ${audioBuffer ? audioBuffer.length : 0} bytes).` }, { quoted: msg });
            }

            const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
            if (audioBuffer.length > 16 * 1024 * 1024) {
                console.log('[DLMP3] Audio too large:', fileSizeMB, 'MB');
                return sock.sendMessage(from, { text: `❌ Audio too large (${fileSizeMB} MB). Max 16 MB.` }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp3`);
            fs.writeFileSync(tempFile, audioBuffer);
            console.log('[DLMP3] Saved temp file:', tempFile);

            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                ptt: false
            }, { quoted: msg });
            console.log('[DLMP3] Audio sent successfully');

            fs.unlinkSync(tempFile);
            console.log('[DLMP3] Temp file deleted');
        } catch (error) {
            console.error('[DLMP3] ERROR:', error.message);
            if (error.response) {
                console.error('[DLMP3] Response status:', error.response.status);
                console.error('[DLMP3] Response data:', error.response.data ? String(error.response.data).slice(0, 200) : 'no data');
            }
            await sock.sendMessage(from, { text: '❌ Failed to download MP3. Check console for details.' }, { quoted: msg });
        }
    }
};
