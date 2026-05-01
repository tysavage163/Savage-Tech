#!/bin/bash

declare -A logos=(
  ["logo3d"]="3d"
  ["logofire"]="fire"
  ["logoneon"]="neon"
  ["logochrome"]="chrome"
  ["logographic"]="graphic"
  ["logogold"]="gold"
  ["logosilver"]="silver"
  ["logowood"]="wood"
  ["logostone"]="stone"
  ["logoglass"]="glass"
  ["logomatrix"]="matrix"
  ["logowater"]="water"
  ["logosnow"]="snow"
  ["logocartoon"]="cartoon"
  ["logograffiti"]="graffiti"
  ["logohologram"]="hologram"
  ["logopixel"]="pixel"
)

for cmd in "${!logos[@]}"; do
  effect="${logos[$cmd]}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
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
  category: 'photo effects',
  description: 'Generate CMD_NAME logo effect',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <text>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🖌️ Applying *EFFECT_NAME* logo style for @' + sender + '...', mentions: [jid] });
      const api = 'https://apis.xwolf.space/api/logo/EFFECT_TYPE?text=' + encodeURIComponent(text);
      const response = await axios.get(api, { agent, responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      let img;
      if (contentType.startsWith('image/')) {
        img = Buffer.from(response.data);
      } else {
        const json = JSON.parse(response.data.toString());
        if (json.success && json.result) {
          if (json.result.startsWith('http')) img = await downloadFile(json.result);
          else if (json.result.startsWith('data:image')) img = Buffer.from(json.result.split(',')[1], 'base64');
          else throw new Error('Unknown format');
        } else {
          throw new Error(json.error || 'API failed');
        }
      }
      const caption = '⭐ *Logo Effect: EFFECT_NAME*\n👤 REQUESTED BY: @' + sender + '\n🚀 POWERED BY SAVAGE-CORE';
      await sock.sendMessage(msg.key.remoteJid, { image: img, caption: caption, mentions: [jid] });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed: ' + err.message });
    }
  }
};
ENDJS
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/EFFECT_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/EFFECT_TYPE/${effect}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All logo commands generated."
