#!/bin/bash
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
  description: 'Apply CMD_NAME effect to a direct audio URL',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <direct_audio_url>' });
    if (!url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Invalid URL.' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎧 *SAVAGE-TECH* is applying *CMD_NAME* effect for @${senderName}...`, mentions: mention });

      const apiUrl = `https://apis.xwolf.space/api/audio/ENDPOINT?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent });

      // Verify API success
      const success = response.data.success === true || response.data.success === 'true';
      if (!success) throw new Error(response.data.error || 'API returned failure');

      // Extract base64 audio data
      let base64Audio = response.data.result?.base64Data || response.data.base64Data || response.data.data;
      if (!base64Audio) {
        // Try to see if result is a string containing the base64
        if (typeof response.data.result === 'string') base64Audio = response.data.result;
        else throw new Error('No audio data found in API response');
      }

      // Remove data URL prefix if present
      if (base64Audio.startsWith('data:audio')) {
        base64Audio = base64Audio.split(',')[1];
      }

      const audioBuffer = Buffer.from(base64Audio, 'base64');
      if (audioBuffer.length === 0) throw new Error('Decoded audio is empty');

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
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/ENDPOINT/${endpoint}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All audio effects fixed."
