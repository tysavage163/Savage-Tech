#!/bin/bash
effects=(
  "mirror" "formulaoneracer" "warrior" "knight" "biker" "surfer"
  "blackwhitegallery" "galleryvisitor" "paintingandsketches" "passingbythepainting" "silhouettes"
  "tulips" "cafe" "underground" "reconstruction" "posters" "melbournegallery"
  "fatmaker" "photobooth" "labembroidery" "diploma" "legoportrait" "pencildrawing"
  "rainynight" "nightmotion" "campaign" "bicycle" "citylight" "affiche"
  "faceswap" "filmeffect" "engravement" "postersonthewall" "posterwall"
  "spaceromance" "filmscan" "keepcalm" "hogwartsletter" "instantcamera" "clown"
  "quadriptych" "moviemarquee" "cookieswriting" "triptych" "graffititext" "woodensign"
  "books" "tvinterference" "footballfan" "treecarving" "soupletters" "foggywindowwriting"
  "numberplate" "doubleexposure" "blinkinglights" "lifebuoy" "hearttattoo" "nightvision"
  "artisticfilter" "planebanner" "fortunecookie" "pendant" "lipstickwriting" "lightwriting"
  "neonsign" "ledroadsign" "airline" "leprechaunhat" "noir" "spyddossier"
)

for effect in "${effects[@]}"; do
  cmd="${effect}"
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
  description: 'Apply CMD_NAME effect to an image via PhotoFunia',
  async execute(sock, msg, args) {
    const imgUrl = args[0];
    if (!imgUrl) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <image_url>' });
    if (!imgUrl.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Provide a valid image URL.' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎨 Applying *CMD_NAME* effect for @${sender}...`, mentions: [jid] });

      const apiUrl = `https://apis.xwolf.space/api/photofunia/CMD_NAME?imageUrl=${encodeURIComponent(imgUrl)}`;
      const response = await axios.get(apiUrl, { agent, responseType: 'arraybuffer', timeout: 30000 });

      let imageBuffer;
      const contentType = response.headers['content-type'] || '';

      if (contentType.startsWith('image/')) {
        imageBuffer = Buffer.from(response.data);
      } else {
        try {
          const json = JSON.parse(response.data.toString());
          if (json.success && json.result) {
            if (json.result.startsWith('http')) {
              imageBuffer = await downloadFile(json.result);
            } else if (json.result.startsWith('data:image')) {
              imageBuffer = Buffer.from(json.result.split(',')[1], 'base64');
            } else {
              throw new Error('Unknown result format');
            }
          } else {
            throw new Error(json.error || 'API did not return success');
          }
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('Invalid API response');
        }
      }

      const caption = `🖼️ *PhotoFunia: CMD_NAME*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { image: imageBuffer, caption: caption, mentions: [jid] });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      let errorMsg = err.message;
      if (err.response && err.response.status === 429) errorMsg = 'Rate limited. Try again later.';
      else if (err.code === 'ECONNABORTED') errorMsg = 'Request timeout. The server may be slow.';
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${errorMsg}` });
    }
  }
};
ENDJS
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All PhotoFunia commands regenerated."
