const http = require('http');
const os = require('os');
const PORT = process.env.PORT || 3000;

function getHostPlatform() {
    if (process.env.DYNO) return 'Heroku (Dyno)';
    if (process.env.RENDER) return 'Render';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.KOYEB) return 'Koyeb';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.REPLIT_DB_URL) return 'Replit';
    if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux (Android)';
    if (os.platform() === 'linux') return 'Linux VPS';
    return 'Unknown / Local';
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

setTimeout(() => {
    require('./index.js');
}, 1000);

const server = http.createServer((req, res) => {
    const uptimeSec = process.uptime();
    const uptime = formatUptime(uptimeSec);
    const platform = getHostPlatform();
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMem = (totalMem - freeMem).toFixed(0);
    const nodeVer = process.version;
    const commandsCount = global.commands ? global.commands.size : '?';

    const quotes = [
        "The system is online. Your irrelevance persists.",
        "Savage core humming. No anomalies detected.",
        "I don't sleep. I wait. I execute.",
        "Status: Predatory. All systems nominal.",
        "Spencer's code is flawless. The engine purrs."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SΛVΛGΞ-TECH</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: url('https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/d565f511-d614-4bd8-87a6-2841dac051a9.png') no-repeat center center fixed;
            background-size: cover;
            font-family: 'Courier New', 'Monaco', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .status-card {
            max-width: 700px;
            width: 100%;
            background: rgba(10, 15, 30, 0.75);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(42, 58, 90, 0.8);
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 20px 35px rgba(0,0,0,0.5), 0 0 15px rgba(0,255,255,0.1);
            transition: all 0.3s ease;
        }
        .glow {
            text-align: center;
            font-size: 2.2rem;
            font-weight: bold;
            letter-spacing: 3px;
            color: #b0e0ff;
            text-shadow: 0 0 8px #0af, 0 0 2px #0af;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #2a4a6a;
            display: inline-block;
            width: 100%;
        }
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        .stat-item {
            background: rgba(15, 23, 42, 0.8);
            padding: 0.8rem;
            border-radius: 16px;
            border-left: 4px solid #3b82f6;
        }
        .stat-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #7e8ba3;
        }
        .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: #cbd5e6;
            word-break: break-word;
        }
        .quote {
            background: rgba(10, 15, 30, 0.7);
            border-radius: 20px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: center;
            color: #a0b0d0;
            font-style: italic;
            border: 1px solid #2a3a55;
        }
        .contact-button {
            display: block;
            text-align: center;
            margin: 20px auto 10px;
            width: fit-content;
            background: #1f2a48;
            color: #e0e0ff;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 40px;
            font-weight: bold;
            font-size: 0.9rem;
            border: 1px solid #4a6a9a;
            transition: 0.2s;
        }
        .contact-button:hover {
            background: #2a3a6a;
            box-shadow: 0 0 10px #0af;
            color: white;
        }
        .footer {
            margin-top: 1rem;
            text-align: center;
            font-size: 0.7rem;
            color: #6a7a9a;
        }
        hr {
            border-color: #2a3a55;
            margin: 1rem 0;
        }
        @media (max-width: 500px) {
            .stats { grid-template-columns: 1fr; }
            .glow { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="status-card">
        <div class="glow">⚡ SΛVΛGΞ-TECH ⚡</div>
        <div class="stats">
            <div class="stat-item">
                <div class="stat-label">HOST PLATFORM</div>
                <div class="stat-value">${platform}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">UPTIME</div>
                <div class="stat-value">${uptime}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">NODE.JS</div>
                <div class="stat-value">${nodeVer}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">COMMANDS</div>
                <div class="stat-value">${commandsCount}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">MEMORY USAGE</div>
                <div class="stat-value">${usedMem} MB / ${totalMem} MB</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">STATUS</div>
                <div class="stat-value">🟢 PREDATORY</div>
            </div>
        </div>
        <div class="quote">❄️ “${randomQuote}”</div>
        <hr />
        <div class="footer">
            Inspired by Meryl<br>
            All rights reserved Savage-Tech<br>
            © 2025 Savage Core
        </div>
        <a href="https://wa.me/254798841125" target="_blank" class="contact-button">
            📱 CONTACT DEVELOPER
        </a>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});
