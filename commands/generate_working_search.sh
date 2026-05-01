#!/bin/bash

# Wikipedia
cat > wiki.js << 'WIKIJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'wiki',
  category: 'search menu',
  description: 'Search Wikipedia articles',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .wiki <search term>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching Wikipedia for "${query}" @${sender}...`, mentions: [jid] });
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { httpsAgent: agent });
      if (!res.data.title) throw new Error('Not found');
      const result = `📖 *WIKIPEDIA: ${res.data.title}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n${(res.data.extract || 'No description.').slice(0, 1500)}\n\n🔗 ${res.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`}`;
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Wiki search failed: ${err.message}` });
    }
  }
};
WIKIJS
echo "✅ Created wiki.js"

# Urban Dictionary
cat > urban.js << 'URBANJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'urban',
  category: 'search menu',
  description: 'Search Urban Dictionary',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .urban <term>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching Urban Dictionary for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`, { httpsAgent: agent });
      if (!res.data.list.length) throw new Error('No definitions');
      const def = res.data.list[0];
      const result = `📖 *URBAN: ${def.word}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\nDefinition: ${def.definition.slice(0, 800)}\n\nExample: ${def.example.slice(0, 300)}\n\n👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}\n🔗 ${def.permalink}`;
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Urban search failed: ${err.message}` });
    }
  }
};
URBANJS
echo "✅ Created urban.js"

# GitHub
cat > github.js << 'GITHUBJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'github',
  category: 'search menu',
  description: 'Search GitHub repositories',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .github <query>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching GitHub for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, { httpsAgent: agent, headers: { 'User-Agent': 'Savage-Bot' } });
      if (!res.data.items.length) throw new Error('No repos');
      let text = `🐙 *GITHUB SEARCH: ${query}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      res.data.items.slice(0, 5).forEach((repo, i) => {
        text += `${i+1}. ${repo.full_name}\n   ⭐ ${repo.stargazers_count} | 📝 ${(repo.description || 'No description').slice(0, 100)}\n   🔗 ${repo.html_url}\n\n`;
      });
      await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ GitHub search failed: ${err.message}` });
    }
  }
};
GITHUBJS
echo "✅ Created github.js"

# NPM
cat > npm.js << 'NPMJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'npm',
  category: 'search menu',
  description: 'Search NPM packages',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .npm <package>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching NPM for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`, { httpsAgent: agent });
      if (!res.data.objects.length) throw new Error('No packages');
      let text = `📦 *NPM SEARCH: ${query}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      res.data.objects.slice(0, 5).forEach((pkg, i) => {
        const p = pkg.package;
        text += `${i+1}. ${p.name}\n   📌 ${p.version} | 📝 ${(p.description || 'No description').slice(0, 100)}\n   🔗 ${p.links.npm}\n\n`;
      });
      await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ NPM search failed: ${err.message}` });
    }
  }
};
NPMJS
echo "✅ Created npm.js"

# PyPI
cat > pypi.js << 'PYPIJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'pypi',
  category: 'search menu',
  description: 'Search PyPI packages',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .pypi <package>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching PyPI for "${query}" @${sender}...`, mentions: [jid] });
      const res = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(query)}/json`, { httpsAgent: agent });
      const info = res.data.info;
      const result = `🐍 *PYPI: ${info.name}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n📦 Version: ${info.version}\n📝 Summary: ${info.summary || 'No summary'}\n🔗 ${info.package_url || `https://pypi.org/project/${info.name}`}`;
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      if (err.response?.status === 404) await sock.sendMessage(msg.key.remoteJid, { text: `❌ Package "${query}" not found.` });
      else await sock.sendMessage(msg.key.remoteJid, { text: `❌ PyPI search failed: ${err.message}` });
    }
  }
};
PYPIJS
echo "✅ Created pypi.js"

echo "All working search commands generated (wiki, urban, github, npm, pypi)."
