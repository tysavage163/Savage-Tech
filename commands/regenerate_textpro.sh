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
  cat > "${cmd}.js" << EOF
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

module.exports = {
  name: '${cmd}',
  category: 'tools',
  description: 'Generate ${endpoint} text effect',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .${cmd} <text>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mentionedJid = [senderJid];

    try {
      const apiUrl = \`https://apis.xwolf.space/api/textpro/${endpoint}?text=\${encodeURIComponent(text)}\`;
      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      
      let imageBuffer;
      const contentType = res.headers['content-type'] || '';
      
      if (contentType.startsWith('image/')) {
        imageBuffer = Buffer.from(res.data);
      } else {
        const json = JSON.parse(res.data.toString());
        if (json.success && json.result) {
          imageBuffer = await downloadFile(json.result);
        } else {
          throw new Error('Invalid API response');
        }
      }

      const caption = \`🎨 *Text Effect: ${cmd}*\n👤 REQUESTED BY: @\${senderName}\n🚀 POWERED BY SAVAGE-CORE\`;
      await sock.sendMessage(msg.key.remoteJid, {
        image: imageBuffer,
        caption: caption,
        mentions: mentionedJid
      });
    } catch (error) {
      console.error('${cmd} error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: \`❌ Failed to generate image.\\n\${error.message}\` });
    }
  }
};
EOF
  echo "✅ Created ${cmd}.js"
done
echo "All 27 text effect commands regenerated."
