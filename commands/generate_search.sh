#!/bin/bash

declare -A searches=(
  ["reddit"]="reddit?q="
  ["urbandictionary"]="urbandictionary?q="
  ["emoji"]="emoji?q="
  ["country"]="country?q="
  ["images"]="images?q="
  ["videos"]="videos?q="
  ["wiki"]="wiki?q="
  ["news"]="news?q="
  ["github"]="github?q="
  ["npm"]="npm?q="
  ["pypi"]="pypi?q="
  ["stackoverflow"]="stackoverflow?q="
)

for cmd in "${!searches[@]}"; do
  endpoint="${searches[$cmd]}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'CMD_NAME',
  category: 'search menu',
  description: 'Search CMD_NAME using Wolf API',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <search term>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Searching ' + 'CMD_NAME' + ' for "' + query + '" @' + sender + '...', mentions: [jid] });
      const api = `https://apis.xwolf.space/api/search/ENDPOINT${encodeURIComponent(query)}`;
      const response = await axios.get(api, { agent });
      const data = response.data;
      let resultText = `🔎 *SEARCH RESULTS: CMD_NAME*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      
      if (data.success) {
        const items = data.result || data.data || data.items || [];
        if (Array.isArray(items) && items.length) {
          items.slice(0, 5).forEach((item, i) => {
            if (cmd === 'reddit') resultText += `${i+1}. r/${item.subreddit}: ${item.title}\n   🔗 ${item.url}\n\n`;
            else if (cmd === 'urbandictionary') resultText += `${i+1}. ${item.word}: ${item.definition}\n   Example: ${item.example}\n\n`;
            else if (cmd === 'emoji') resultText += `${item.emoji} - ${item.description}\n`;
            else if (cmd === 'country') resultText += `${item.name.common}: ${item.capital?.[0]} | Population: ${item.population}\n`;
            else if (cmd === 'wiki') resultText += `${i+1}. ${item.title}\n   ${item.summary}\n   🔗 ${item.url}\n\n`;
            else if (cmd === 'news') resultText += `${i+1}. ${item.title}\n   ${item.source} - ${item.published}\n   🔗 ${item.url}\n\n`;
            else if (cmd === 'github') resultText += `${i+1}. ${item.full_name}\n   ⭐ ${item.stargazers_count} | 📝 ${item.description}\n   🔗 ${item.html_url}\n\n`;
            else if (cmd === 'npm') resultText += `${i+1}. ${item.name}\n   📦 ${item.version} | 📝 ${item.description}\n   🔗 ${item.links?.npm}\n\n`;
            else if (cmd === 'pypi') resultText += `${i+1}. ${item.name}\n   📝 ${item.summary}\n   🔗 https://pypi.org/project/${item.name}\n\n`;
            else if (cmd === 'stackoverflow') resultText += `${i+1}. ${item.title}\n   🔗 ${item.link}\n\n`;
            else resultText += `${i+1}. ${JSON.stringify(item)}\n`;
          });
        } else {
          resultText += 'No results found.\n';
        }
      } else {
        resultText += `❌ Error: ${data.error || 'Unknown'}`;
      }
      await sock.sendMessage(msg.key.remoteJid, { text: resultText.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Search failed: ${err.message}` });
    }
  }
};
ENDJS
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s|ENDPOINT|${endpoint}|g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All search commands generated under 'search menu' category."
