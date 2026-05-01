#!/bin/bash

# Correct mapping: command_name -> API endpoint suffix
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
  cat > "${cmd}.js" << 'ENDCODE'
const axios = require('axios');
const https = require('https');

async function downloadFile(url) {
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
      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      let img;
      if (res.headers['content-type']?.startsWith('image/')) {
        img = Buffer.from(res.data);
      } else {
        const json = JSON.parse(res.data.toString());
        if (json.success && json.result) img = await downloadFile(json.result);
        else throw new Error('API did not return an image');
      }

      const caption = `🎨 *Text Effect: CMD_NAME*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { image: img, caption: caption, mentions: mention });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${err.message}` });
    }
  }
};
ENDCODE
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/ENDPOINT/${endpoint}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done

echo "All 27 text effect commands created successfully."
