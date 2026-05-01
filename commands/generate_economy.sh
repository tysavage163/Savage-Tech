#!/bin/bash

declare -A endpoints=(
  ["forex"]="forex?from=USD&to=EUR"
  ["crypto"]="crypto?symbol=BTC"
  ["stock"]="stock?symbol=AAPL"
  ["gold"]="gold"
  ["market"]="market"
  ["inflation"]="inflation?country=US"
  ["gdp"]="gdp?country=US"
  ["bankrate"]="bank-rate?country=US"
  ["news"]="news"
  ["wallet"]="wallet?address=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
)

for cmd in "${!endpoints[@]}"; do
  endpoint="${endpoints[$cmd]}"
  cat > "${cmd}.js" << 'ENDJS'
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'CMD_NAME',
  category: 'financial data',
  description: 'Get CMD_NAME data (USD base for crypto/forex)',
  async execute(sock, msg, args) {
    const param = args[0];
    if (!param && 'CMD_NAME' !== 'market' && 'CMD_NAME' !== 'gold' && 'CMD_NAME' !== 'news') {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .CMD_NAME <parameter>' });
    }

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      let apiUrl = `https://apis.xwolf.space/api/economy/ENDPOINT`;
      // Special handling for commands that need parameters
      if ('CMD_NAME' === 'forex') {
        const [from, to] = param ? param.split(',') : ['USD', 'EUR'];
        apiUrl = `https://apis.xwolf.space/api/economy/forex?from=${from}&to=${to}`;
      } else if ('CMD_NAME' === 'crypto') {
        const symbol = param || 'BTC';
        apiUrl = `https://apis.xwolf.space/api/economy/crypto?symbol=${symbol}`;
      } else if ('CMD_NAME' === 'stock') {
        const ticker = param || 'AAPL';
        apiUrl = `https://apis.xwolf.space/api/economy/stock?symbol=${ticker}`;
      } else if ('CMD_NAME' === 'inflation') {
        const country = param || 'US';
        apiUrl = `https://apis.xwolf.space/api/economy/inflation?country=${country}`;
      } else if ('CMD_NAME' === 'gdp') {
        const country = param || 'US';
        apiUrl = `https://apis.xwolf.space/api/economy/gdp?country=${country}`;
      } else if ('CMD_NAME' === 'bankrate') {
        const country = param || 'US';
        apiUrl = `https://apis.xwolf.space/api/economy/bank-rate?country=${country}`;
      } else if ('CMD_NAME' === 'wallet') {
        const address = param;
        if (!address) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .wallet <crypto_address>' });
        apiUrl = `https://apis.xwolf.space/api/economy/wallet?address=${address}`;
      } else {
        // market, gold, news have no required parameters
        apiUrl = `https://apis.xwolf.space/api/economy/ENDPOINT`;
      }

      const response = await axios.get(apiUrl, { httpsAgent: agent });
      const data = response.data;
      let resultText = `📊 *ECONOMIC DATA: CMD_NAME*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;

      if (data.success) {
        const result = data.result || data.data || data;
        if (typeof result === 'object') {
          resultText += JSON.stringify(result, null, 2);
        } else {
          resultText += result;
        }
      } else {
        resultText += `❌ Error: ${data.error || 'Unknown error'}`;
      }

      await sock.sendMessage(msg.key.remoteJid, { text: resultText.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      console.error('CMD_NAME error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${err.message}` });
    }
  }
};
ENDJS
  sed -i "s/CMD_NAME/${cmd}/g" "${cmd}.js"
  sed -i "s|ENDPOINT|${endpoint}|g" "${cmd}.js"
  echo "✅ Created ${cmd}.js"
done
echo "All economy commands generated under 'financial data' category."
