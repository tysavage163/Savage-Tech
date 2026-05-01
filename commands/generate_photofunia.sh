#!/bin/bash

# List of all PhotoFunia effects from the screenshots
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
  "NumberPlate" "doubleexposure" "blinkinglights" "lifebuoy" "hearttattoo" "nightvision"
  "artisticfilter" "planebanner" "fortunecookie" "pendant" "lipstickwriting" "lightwriting"
  "neonsign" "Ledroadsign" "airline" "Leprechaunhat" "noir" "spyddossier"
)

for effect in "${effects[@]}"; do
  # Convert effect name to lowercase for consistency (already lowercase except some)
  cmd="${effect,,}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent: httpsAgent }, (res) => {
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
  name: 'EFFECT_NAME',
  category: 'photo effects',
  description: 'Generate EFFECT_NAME effect via PhotoFunia',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .EFFECT_NAME <text>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎨 Generating *EFFECT_NAME* effect for @${senderName}...`, mentions: mention });
      const apiUrl = `https://apis.xwolf.space/api/photofunia/ENDPOINT?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { httpsAgent, responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      let imageBuffer;
      if (contentType.startsWith('image/')) {
        imageBuffer = Buffer.from(response.data);
      } else {
        const json = JSON.parse(response.data.toString());
        if (json.success && json.result) {
          if (json.result.startsWith('http')) imageBuffer = await downloadFile(json.result);
          else if (json.result.startsWith('data:image')) imageBuffer = Buffer.from(json.result.split(',')[1], 'base64');
          else throw new Error('Unknown image format');
        } else {
          throw new Error(json.error || 'API did not return an image');
        }
      }
      const caption = `🖼️ *PhotoFunia: EFFECT_NAME*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { image: imageBuffer, caption: caption, mentions: mention });
    } catch (err) {
      console.error('EFFECT_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${err.message}` });
    }
  }
};
ENDJS
  sed -i "s/EFFECT_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s/ENDPOINT/${effect}/g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All PhotoFunia commands generated."
