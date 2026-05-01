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
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <direct_mp3_url>' });
    if (!url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Provide a valid URL.' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎧 Applying *CMD_NAME* effect for @${senderName}...`, mentions: mention });
      const apiUrl = `https://apis.xwolf.space/api/audio/ENDPOINT?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent, responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      
      if (!contentType.includes('audio')) {
        let err = 'No audio returned.';
        try {
          const json = JSON.parse(response.data.toString());
          err = json.error || json.message || err;
        } catch(e) {}
        throw new Error(err);
      }
      
      const audioBuffer = Buffer.from(response.data);
      const caption = `✨ *CMD_NAME Effect*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
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
