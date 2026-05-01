#!/bin/bash

# 1. urlencode.js
cat > urlencode.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'urlencode',
  category: 'tools',
  description: 'URL encode a string',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .urlencode <text>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/urlencode?text=${encodeURIComponent(text)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.encoded || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔗 *URL Encoded for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 2. urldecode.js
cat > urldecode.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'urldecode',
  category: 'tools',
  description: 'URL decode a string',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .urldecode <encoded_string>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/urldecode?text=${encodeURIComponent(text)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.decoded || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔓 *URL Decoded for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 3. jsontformat.js (JSON format/validate)
cat > jsontformat.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'jsontformat',
  category: 'tools',
  description: 'Format/validate JSON',
  async execute(sock, msg, args) {
    const json = args.join(' ');
    if (!json) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .jsontformat <json_string>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.post('https://apis.xwolf.space/api/tools/jsontformat', { json }, { httpsAgent: agent });
      const result = res.data.result || res.data.formatted || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📝 *JSON Formatted for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 4. email-validate.js
cat > email-validate.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'email-validate',
  category: 'tools',
  description: 'Validate email format',
  async execute(sock, msg, args) {
    const email = args[0];
    if (!email || !email.includes('@')) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .email-validate <email>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/email-validate?email=${encodeURIComponent(email)}`, { httpsAgent: agent });
      const isValid = res.data.valid ? '✅ Valid email' : '❌ Invalid email';
      const result = res.data.result || isValid;
      await sock.sendMessage(msg.key.remoteJid, { text: `📧 *Email Validation for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 5. ip-validate.js
cat > ip-validate.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'ip-validate',
  category: 'tools',
  description: 'Validate IP address',
  async execute(sock, msg, args) {
    const ip = args[0];
    if (!ip) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .ip-validate <ip_address>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/ip-validate?ip=${encodeURIComponent(ip)}`, { httpsAgent: agent });
      const isValid = res.data.valid ? '✅ Valid IP' : '❌ Invalid IP';
      const result = res.data.result || isValid;
      await sock.sendMessage(msg.key.remoteJid, { text: `🌐 *IP Validation for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 6. hash.js (generate hash)
cat > hash.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'hash',
  category: 'tools',
  description: 'Generate hash from text (md5, sha1, sha256, etc.)',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .hash <text> [algorithm] (default md5)' });
    const parts = text.split(' ');
    const input = parts[0];
    const algo = parts[1] || 'md5';
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/hash?text=${encodeURIComponent(input)}&algo=${algo}`, { httpsAgent: agent });
      const result = res.data.result || res.data.hash || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔐 *Hash (${algo}) for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 7. uuid.js
cat > uuid.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'uuid',
  category: 'tools',
  description: 'Generate UUID v4',
  async execute(sock, msg, args) {
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/tools/uuid', { httpsAgent: agent });
      const result = res.data.result || res.data.uuid || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🆔 *UUID for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 8. password-strength.js
cat > password-strength.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'password-strength',
  category: 'tools',
  description: 'Check password strength',
  async execute(sock, msg, args) {
    const pwd = args.join(' ');
    if (!pwd) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .password-strength <password>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/password-strength?password=${encodeURIComponent(pwd)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.strength || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔒 *Password Strength for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 9. screenshot.js
cat > screenshot.js << 'EOF'
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
EOF

# 10. base64encode.js
cat > base64encode.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'base64encode',
  category: 'tools',
  description: 'Encode text to Base64',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .base64encode <text>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/base64encode?text=${encodeURIComponent(text)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.encoded || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔢 *Base64 Encoded for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 11. base64decode.js
cat > base64decode.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'base64decode',
  category: 'tools',
  description: 'Decode Base64 to text',
  async execute(sock, msg, args) {
    const base64 = args.join(' ');
    if (!base64) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .base64decode <base64_string>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/base64decode?text=${encodeURIComponent(base64)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.decoded || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔓 *Base64 Decoded for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 12. textstats.js
cat > textstats.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'textstats',
  category: 'tools',
  description: 'Analyze text statistics',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .textstats <text>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/textstats?text=${encodeURIComponent(text)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.stats;
      let stats = '';
      if (typeof result === 'object') stats = `Characters: ${result.characters}\nWords: ${result.words}\nLines: ${result.lines}\nSentences: ${result.sentences}`;
      else stats = result || 'No stats';
      await sock.sendMessage(msg.key.remoteJid, { text: `📊 *Text Stats for @${sender}*\n\n${stats}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 13. password.js (generate random password)
cat > password.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'password',
  category: 'tools',
  description: 'Generate secure random password',
  async execute(sock, msg, args) {
    let length = parseInt(args[0]) || 12;
    if (length < 4) length = 4;
    if (length > 32) length = 32;
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/password?length=${length}`, { httpsAgent: agent });
      const result = res.data.result || res.data.password || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔑 *Generated Password (${length} chars) for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 14. lorem.js
cat > lorem.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'lorem',
  category: 'tools',
  description: 'Generate Lorem Ipsum text',
  async execute(sock, msg, args) {
    let paragraphs = parseInt(args[0]) || 1;
    if (paragraphs < 1) paragraphs = 1;
    if (paragraphs > 10) paragraphs = 10;
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/lorem?paragraphs=${paragraphs}`, { httpsAgent: agent });
      const result = res.data.result || res.data.text || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📝 *Lorem Ipsum (${paragraphs} para) for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 15. color.js
cat > color.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'color',
  category: 'tools',
  description: 'Generate random color with hex/rgb/hsl',
  async execute(sock, msg, args) {
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/tools/color', { httpsAgent: agent });
      const result = res.data.result || res.data.color;
      let colorText = '';
      if (typeof result === 'object') colorText = `Hex: ${result.hex}\nRGB: ${result.rgb}\nHSL: ${result.hsl}`;
      else colorText = result || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🎨 *Random Color for @${sender}*\n\n${colorText}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 16. timestamp.js
cat > timestamp.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'timestamp',
  category: 'tools',
  description: 'Get current timestamp in multiple formats',
  async execute(sock, msg, args) {
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/tools/timestamp', { httpsAgent: agent });
      const result = res.data.result || res.data.timestamp;
      let ts = '';
      if (typeof result === 'object') ts = `Unix: ${result.unix}\nISO: ${result.iso}\nUTC: ${result.utc}`;
      else ts = result || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `⏱️ *Current Timestamp for @${sender}*\n\n${ts}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 17. qrcode.js
cat > qrcode.js << 'EOF'
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
  name: 'qrcode',
  category: 'tools',
  description: 'Generate QR code image from text',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .qrcode <text or URL>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/qrcode?text=${encodeURIComponent(text)}`, { httpsAgent: agent, responseType: 'arraybuffer' });
      let imgBuffer;
      if (res.headers['content-type'].startsWith('image/')) imgBuffer = Buffer.from(res.data);
      else { const json = JSON.parse(res.data.toString()); if (json.result && json.result.startsWith('http')) imgBuffer = await downloadFile(json.result); else throw new Error('No image'); }
      await sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: `📱 *QR Code for @${sender}*\n\nContent: ${text.slice(0, 100)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 18. bible.js
cat > bible.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'bible',
  category: 'tools',
  description: 'Lookup Bible verse',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .bible <verse> (e.g., John 3:16)' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/bible?verse=${encodeURIComponent(query)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.verse || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📖 *Bible Verse for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 19. dictionary.js
cat > dictionary.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'dictionary',
  category: 'tools',
  description: 'Get word definition and meanings',
  async execute(sock, msg, args) {
    const word = args[0];
    if (!word) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .dictionary <word>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/dictionary?word=${encodeURIComponent(word)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.definition || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📚 *Dictionary: ${word} for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 20. wikipedia.js (tools version)
cat > wikipedia.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'wikipedia',
  category: 'tools',
  description: 'Get Wikipedia article summary',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .wikipedia <topic>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/wikipedia?query=${encodeURIComponent(query)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.summary || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📖 *Wikipedia: ${query} for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

# 21. weather.js
cat > weather.js << 'EOF'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'weather',
  category: 'tools',
  description: 'Get current weather for a city',
  async execute(sock, msg, args) {
    const city = args.join(' ');
    if (!city) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .weather <city_name>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/weather?city=${encodeURIComponent(city)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.weather || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🌤️ *Weather in ${city} for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
EOF

echo "All 21 tool commands created under 'tools' category."
