#!/bin/bash

# Audio effects: category = "Audio Effects"
declare -A audio_effects=(
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

# Spotify commands: category = "Audio"
declare -A spotify_commands=(
  ["spotifytrack"]="track"
  ["spotifyalbum"]="album"
  ["spotifyartist"]="artist"
  ["spotifyplaylist"]="playlist"
  ["spotifysearch"]="search"
)

# Helper function to create command files
create_cmd() {
  local cmd_name=$1
  local endpoint=$2
  local category=$3
  local api_base="https://apis.xwolf.space/api"

  cat > "${cmd_name}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'CMD_NAME',
  category: 'CATEGORY',
  description: 'Apply CMD_NAME effect to audio (Wolf API)',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <audio_url>' });
    if (!url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a valid audio URL (http/https).' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎧 *SAVAGE-TECH* is applying the *CMD_NAME* effect for @${senderName}...`, mentions: mention });
      
      const apiUrl = `API_BASE_URL/ENDPOINT?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent, responseType: 'arraybuffer' });
      
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('audio')) {
        const textResponse = response.data.toString('utf-8');
        try {
          const json = JSON.parse(textResponse);
          throw new Error(json.error || json.message || 'API did not return audio data');
        } catch (parseErr) {
          throw new Error('API did not return audio data');
        }
      }
      
      const audioBuffer = Buffer.from(response.data);
      if (audioBuffer.length === 0) throw new Error('Received empty audio data');
      
      const caption = `✨ *CMD_NAME Effect Applied*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      
      await sock.sendMessage(msg.key.remoteJid, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${cmd_name}_effect.mp3`,
        caption: caption,
        mentions: mention
      });
    } catch (err) {
      console.error(`CMD_NAME error:`, err);
      let errorMsg = err.message;
      if (err.response) {
        if (err.response.status === 404) errorMsg = 'Effect not found on server.';
        else if (err.response.status === 400) errorMsg = 'Invalid audio URL or format.';
        else errorMsg = `Server error: ${err.response.status}`;
      }
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to apply effect: ${errorMsg}` });
    }
  }
};
ENDJS

  sed -i "s|CMD_NAME|${cmd_name}|g" "${cmd_name}.js"
  sed -i "s|CATEGORY|${category}|g" "${cmd_name}.js"
  sed -i "s|API_BASE_URL|${api_base}|g" "${cmd_name}.js"
  sed -i "s|ENDPOINT|${endpoint}|g" "${cmd_name}.js"
  echo "✅ Created ${cmd_name}.js (category: ${category})"
}

# Generate audio effects (category "Audio Effects")
for cmd in "${!audio_effects[@]}"; do
  create_cmd "$cmd" "audio/${audio_effects[$cmd]}" "Audio Effects"
done

# Generate Spotify commands (category "Audio")
for cmd in "${!spotify_commands[@]}"; do
  create_cmd "$cmd" "spotify/${spotify_commands[$cmd]}" "Audio"
done

echo "All commands generated: audio effects (category 'Audio Effects'), Spotify (category 'Audio')."
