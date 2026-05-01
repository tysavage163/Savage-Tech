#!/bin/bash

# List of commands and their corresponding API endpoints
declare -A effects=(
  ["bass"]="bass"
  ["bassboost"]="bassboost"
  ["robot"]="robot"
  ["chipmunk"]="chipmunk"
  ["deep"]="deep"
  ["echo"]="echo"
  ["reverb"]="reverb"
  ["nightcore"]="nightcore"
  ["slowed"]="slowed"
  ["8d"]="8d"
  ["vaporwave"]="vaporwave"
  ["karaoke"]="karaoke"
  ["treble"]="treble"
  ["distortion"]="distortion"
  ["flanger"]="flanger"
  ["phaser"]="phaser"
  ["chorus"]="chorus"
  ["vibrato"]="vibrato"
  ["tremolo"]="tremolo"
  ["reverse"]="reverse"
  ["speed2x"]="speed2x"
  ["slow05x"]="slow05x"
  ["telephone"]="telephone"
  ["underwater"]="underwater"
  ["megaphone"]="megaphone"
)

for cmd in "${!effects[@]}"; do
  endpoint="${effects[$cmd]}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'CMD_NAME',
  category: 'Audio Effects',
  description: 'Apply CMD_NAME effect to a direct AUDIO URL (MP3/WAV)',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <direct_audio_url>\nExample: .CMD_NAME https://example.com/song.mp3' });
    if (!url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Provide a valid HTTP/HTTPS URL.' });
    if (!url.match(/\.(mp3|wav|ogg|m4a)(\?|$)/i)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '⚠️ This command only works with direct audio file URLs (ending in .mp3, .wav, etc.).\nIt does NOT work with Spotify/YouTube links.' });
    }

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎧 *SAVAGE-TECH* is applying *CMD_NAME* effect for @${senderName}...`, mentions: mention });
      const apiUrl = `https://apis.xwolf.space/api/audio/ENDPOINT?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent, responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('audio')) {
        let errMsg = 'API did not return audio data.';
        try {
          const json = JSON.parse(response.data.toString());
          errMsg = json.error || json.message || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }
      const audioBuffer = Buffer.from(response.data);
      const caption = `✨ *CMD_NAME Effect Applied*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${cmd}_effect.mp3`,
        caption: caption,
        mentions: mention
      });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${err.message}` });
    }
  }
};
ENDJS
  # Replace placeholders
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/ENDPOINT/${endpoint}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All audio effects regenerated."
