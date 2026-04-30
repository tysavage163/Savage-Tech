// deepseek.js - Chat with DeepSeek AI via apis.xwolf.space
const axios = require('axios');

async function deepseek(message) {
  try {
    const url = `https://apis.xwolf.space/api/ai/deepseek?q=${encodeURIComponent(message)}`;
    const response = await axios.get(url);
    
    if (response.data.status === true) {
      return response.data.result || "No response text.";
    } else {
      return `API error: ${response.data.error || 'Unknown error'}`;
    }
  } catch (error) {
    console.error('DeepSeek error:', error.message);
    return 'Failed to reach DeepSeek API.';
  }
}

module.exports = deepseek;
