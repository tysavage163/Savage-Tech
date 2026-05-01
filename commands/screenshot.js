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
  name: 'screenshot',
  category: 'tools',
  description: 'Take website screenshot',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .screenshot <https://example.com>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/screenshot?url=${encodeURIComponent(url)}`, { httpsAgent: agent, responseType: 'arraybuffer' });
      let imgBuffer;
      if (res.headers['content-type'].startsWith('image/')) imgBuffer = Buffer.from(res.data);
      else { const json = JSON.parse(res.data.toString()); if (json.result && json.result.startsWith('http')) imgBuffer = await downloadFile(json.result); else throw new Error('No image'); }
      await sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: `📸 *Screenshot of ${url} for @${sender}*\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
