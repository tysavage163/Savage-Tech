#!/bin/bash
declare -A effects=(
  ["icefire"]="ice-fire"
  ["embossed"]="embossed"
  ["goldembossed"]="gold-embossed"
  ["classicgold"]="classic-gold"
  ["retro"]="retro"
  ["groovy"]="groovy"
  ["copperchrome"]="copper-chrome"
  ["epic3d"]="epic-3d"
  ["simple3d"]="simple-3d"
  ["fire"]="fire"
  ["inferno"]="inferno"
  ["lava"]="lava"
  ["3dblue"]="3d-blue"
  ["3dred"]="3d-red"
  ["3dgreen"]="3d-green"
  ["3dpurple"]="3d-purple"
  ["chrome"]="chrome"
  ["goldchrome"]="gold-chrome"
  ["neonred"]="neon-red"
  ["neongold"]="neon-gold"
  ["neoncyan"]="neon-cyan"
  ["neonorange"]="neon-orange"
  ["neonwhite"]="neon-white"
  ["3doutline"]="3d-outline"
  ["alienglow"]="alien-glow"
  ["neonblue"]="neon-blue"
  ["neonpink"]="neon-pink"
  ["neonpurple"]="neon-purple"
)

for cmd in "${!effects[@]}"; do
  endpoint="${effects[$cmd]}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'CMD_NAME',
  category: 'tools',
  description: 'Generate ENDPOINT text effect',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <text>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      const apiUrl = `https://apis.xwolf.space/api/textpro/ENDPOINT?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';

      // If directly an image
      if (contentType.startsWith('image/')) {
        const imgBuffer = Buffer.from(response.data);
        const caption = `🎨 *Text Effect: CMD_NAME*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
        return sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: caption, mentions: mention });
      }

      // Otherwise parse as JSON
      const jsonString = response.data.toString('utf-8');
      let json;
      try {
        json = JSON.parse(jsonString);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${jsonString.substring(0, 100)}`);
      }

      if (!json.success) throw new Error(json.error || 'API returned failure');

      let imgBuffer = null;
      if (json.result) {
        if (json.result.startsWith('http')) {
          imgBuffer = await downloadFile(json.result);
        } else if (json.result.startsWith('data:image')) {
          const base64 = json.result.split(',')[1];
          imgBuffer = Buffer.from(base64, 'base64');
        } else {
          // Maybe the result is already base64 without prefix
          imgBuffer = Buffer.from(json.result, 'base64');
        }
      } else if (json.image) {
        imgBuffer = Buffer.from(json.image, 'base64');
      } else {
        throw new Error('No image data found in response');
      }

      const caption = `🎨 *Text Effect: CMD_NAME*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: caption, mentions: mention });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to generate image.\n${err.message}` });
    }
  }
};
ENDJS
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/ENDPOINT/${endpoint}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All 27 text effect commands regenerated with JSON handling."
