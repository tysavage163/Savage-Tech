const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function formatNumber(num) {
  if (num === undefined || num === null) return 'N/A';
  if (typeof num === 'number') {
    if (num > 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num > 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num > 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  }
  return num;
}

module.exports = {
  name: 'crypto',
  category: 'financial data',
  description: 'Get crypto data',
  async execute(sock, msg, args) {
    const param = args[0];
    if (!param && 'crypto' !== 'market' && 'crypto' !== 'gold' && 'crypto' !== 'news') {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .crypto <parameter>' });
    }

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      let apiUrl = `https://apis.xwolf.space/api/economy/crypto`;
      let paramLabel = '';

      if ('crypto' === 'forex') {
        const [from, to] = param ? param.split(',') : ['USD', 'EUR'];
        apiUrl = `https://apis.xwolf.space/api/economy/forex?from=${from}&to=${to}`;
        paramLabel = `${from}/${to}`;
      } else if ('crypto' === 'crypto') {
        const symbol = param ? param.toUpperCase() : 'BTC';
        apiUrl = `https://apis.xwolf.space/api/economy/crypto?symbol=${symbol}`;
        paramLabel = symbol;
      } else if ('crypto' === 'stock') {
        const ticker = param ? param.toUpperCase() : 'AAPL';
        apiUrl = `https://apis.xwolf.space/api/economy/stock?symbol=${ticker}`;
        paramLabel = ticker;
      } else if ('crypto' === 'inflation') {
        const country = param ? param.toUpperCase() : 'US';
        apiUrl = `https://apis.xwolf.space/api/economy/inflation?country=${country}`;
        paramLabel = country;
      } else if ('crypto' === 'gdp') {
        const country = param ? param.toUpperCase() : 'US';
        apiUrl = `https://apis.xwolf.space/api/economy/gdp?country=${country}`;
        paramLabel = country;
      } else if ('crypto' === 'bankrate') {
        const country = param ? param.toUpperCase() : 'US';
        apiUrl = `https://apis.xwolf.space/api/economy/bank-rate?country=${country}`;
        paramLabel = country;
      } else if ('crypto' === 'wallet') {
        const address = param;
        if (!address) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .wallet <crypto_address>' });
        apiUrl = `https://apis.xwolf.space/api/economy/wallet?address=${address}`;
        paramLabel = address.slice(0, 10) + '...';
      } else {
        // market, gold, news
        apiUrl = `https://apis.xwolf.space/api/economy/crypto`;
      }

      const response = await axios.get(apiUrl, { httpsAgent: agent });
      const data = response.data;
      
      if (!data.success) throw new Error(data.error || 'No data');
      
      let output = `📊 *ECONOMIC DATA: crypto*`;
      if (paramLabel) output += ` (${paramLabel})`;
      output += `\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
      
      // Format based on command type
      if ('crypto' === 'crypto') {
        output += `💎 *${data.symbol || paramLabel}*\n`;
        output += `💰 Price: $${formatNumber(data.price_usd)}\n`;
        if (data.change_24h !== undefined) output += `📈 24h Change: ${data.change_24h > 0 ? '+' : ''}${data.change_24h}%\n`;
        if (data.market_cap_usd) output += `🏦 Market Cap: ${formatNumber(data.market_cap_usd)}\n`;
        if (data.volume_24h_usd) output += `📊 24h Volume: ${formatNumber(data.volume_24h_usd)}\n`;
      } 
      else if ('crypto' === 'stock') {
        output += `📈 *${data.symbol || paramLabel}*\n`;
        output += `💵 Price: $${formatNumber(data.price)}\n`;
        if (data.change !== undefined) output += `📉 Change: ${data.change > 0 ? '+' : ''}${data.change}%\n`;
        if (data.volume) output += `📊 Volume: ${formatNumber(data.volume)}\n`;
      }
      else if ('crypto' === 'forex') {
        output += `💱 *${data.from || 'USD'} → ${data.to || 'EUR'}*\n`;
        output += `💹 Rate: ${data.rate || data.result}\n`;
        if (data.change) output += `📈 Change: ${data.change}%\n`;
      }
      else if ('crypto' === 'gold') {
        output += `🥇 *Gold & Silver*\n`;
        output += `🪙 Gold: $${formatNumber(data.gold)}/oz\n`;
        if (data.silver) output += `🥈 Silver: $${formatNumber(data.silver)}/oz\n`;
      }
      else if ('crypto' === 'market') {
        output += `🌍 *Market Indices*\n`;
        if (data.sp500) output += `📊 S&P 500: ${formatNumber(data.sp500)}\n`;
        if (data.dow) output += `📈 Dow Jones: ${formatNumber(data.dow)}\n`;
        if (data.nasdaq) output += `📉 Nasdaq: ${formatNumber(data.nasdaq)}\n`;
      }
      else if ('crypto' === 'inflation') {
        output += `📉 *Inflation Rate (${paramLabel || 'US'})*\n`;
        output += `📅 Annual: ${data.rate}%\n`;
        if (data.year) output += `🗓️ Year: ${data.year}\n`;
      }
      else if ('crypto' === 'gdp') {
        output += `📊 *GDP (${paramLabel || 'US'})*\n`;
        output += `💰 GDP: ${formatNumber(data.gdp)}\n`;
        if (data.growth) output += `📈 Growth: ${data.growth}%\n`;
      }
      else if ('crypto' === 'bankrate') {
        output += `🏦 *Central Bank Rate (${paramLabel || 'US'})*\n`;
        output += `💹 Rate: ${data.rate}%\n`;
      }
      else if ('crypto' === 'news') {
        output += `📰 *Financial News*\n\n`;
        const headlines = data.result || data.articles || [];
        if (Array.isArray(headlines) && headlines.length) {
          headlines.slice(0, 5).forEach((item, i) => {
            output += `${i+1}. ${item.title || item.headline}\n`;
            if (item.source) output += `   📍 ${item.source}\n`;
            output += `\n`;
          });
        } else {
          output += `No news available.\n`;
        }
      }
      else if ('crypto' === 'wallet') {
        output += `💳 *Wallet Balance*\n`;
        output += `💰 Balance: ${formatNumber(data.balance)} ${data.currency || 'BTC'}\n`;
        if (data.transactions) output += `🔄 Transactions: ${data.transactions}\n`;
      }
      else {
        output += JSON.stringify(data.result || data, null, 2);
      }

      await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      console.error('crypto error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${err.message}` });
    }
  }
};
