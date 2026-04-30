// test-deepseek.js
const axios = require('axios');

async function test() {
  try {
    const url = 'https://apis.xwolf.space/api/ai/deepseek?q=Hello';
    const res = await axios.get(url);
    console.log('API Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
