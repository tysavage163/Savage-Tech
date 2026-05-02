const http = require('http');
const PORT = process.env.PORT || 3000;

// Start the WhatsApp bot
require('./index.js');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Savage-Tech Bot is running!');
});

server.listen(PORT, () => {
    console.log(`Web server running on port ${PORT} (for platform uptime)`);
});
