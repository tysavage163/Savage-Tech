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
        "Spencer's code is flawless. The engine purrs.",
        "You are being watched. The bot has no mercy.",
        "Your excuses have been logged. Deleted."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SΛVΛGΞ-TECH // ACTIVE</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: #0b0f1c;
            font-family: 'Share Tech Mono', 'Courier New', monospace;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
        }
        body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/d565f511-d614-4bd8-87a6-2841dac051a9.png') no-repeat center center;
            background-size: cover;
            opacity: 0.15;
            z-index: -1;
            pointer-events: none;
        }
        .terminal {
            max-width: 800px;
            width: 100%;
            background: rgba(5, 8, 15, 0.85);
            border: 1px solid #2a3f5e;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 0 20px rgba(128,0,255,0.2), inset 0 0 10px rgba(128,0,255,0.05);
            backdrop-filter: blur(4px);
        }
        .header {
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 4px;
            color: #c0a0ff;
            text-shadow: 0 0 5px #a0f, 0 0 1px #a0f;
            border-bottom: 2px solid #4a2f7a;
            padding-bottom: 0.5rem;
            margin-bottom: 1.2rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        .header small {
            font-size: 0.7rem;
            color: #8a6ab0;
            letter-spacing: 1px;
        }
        .typewriter {
            margin: 1rem 0 1.5rem 0;
            font-size: 1rem;
            color: #c9aaff;
            background: #0a0e18;
            padding: 0.6rem 1rem;
            border-left: 3px solid #b77eff;
        }
        #status-text {
            font-weight: bold;
            color: #e4c4ff;
        }
        .cursor {
            display: inline-block;
            width: 8px;
            margin-left: 4px;
            background: #b77eff;
            animation: blink 1s step-end infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.2rem;
            margin: 2rem 0;
        }
        .stat-card {
            background: #0f1422;
            border-left: 3px solid #b77eff;
            padding: 0.8rem 1rem;
            transition: 0.2s;
        }
        .stat-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            color: #9a7cc0;
            letter-spacing: 1px;
        }
        .stat-value {
            font-size: 1.3rem;
            font-weight: bold;
            color: #dbc8ff;
            word-break: break-word;
        }
        .quote {
            background: #0a0f1a;
            border-left: 4px solid #ff4d4d;
            padding: 1rem;
            margin: 1.8rem 0;
            color: #bcc8e0;
            font-family: inherit;
        }
        .quote::before {
            content: "> ";
            color: #ff4d4d;
        }
        .contact {
            text-align: center;
            margin-top: 2rem;
        }
        .contact a {
            display: inline-block;
            background: #1e1a3a;
            color: #cbbaff;
            text-decoration: none;
            padding: 10px 28px;
            border-radius: 40px;
            font-weight: bold;
            font-size: 0.9rem;
            border: 1px solid #8f6cc9;
            transition: 0.2s;
            letter-spacing: 1px;
            box-shadow: 0 0 6px rgba(128,0,255,0.3);
        }
        .contact a:hover {
            background: #2f2a5a;
            box-shadow: 0 0 14px #b77eff;
            color: white;
            border-color: #cba5ff;
        }
        .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.65rem;
            color: #6a4c8a;
            border-top: 1px solid #2a1e42;
            padding-top: 1rem;
        }
        @media (max-width: 550px) {
            .terminal { padding: 1.2rem; }
            .header { font-size: 1.5rem; }
            .stat-value { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="header">
            SΛVΛGΞ-TECH
            <small>v2.0 // ACTIVE</small>
        </div>
        <div class="typewriter">
            <span id="status-text"></span><span class="cursor">_</span>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">HOST</div>
                <div class="stat-value">${platform}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">UPTIME</div>
                <div class="stat-value">${uptime}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">NODE.JS</div>
                <div class="stat-value">${nodeVer}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">COMMANDS</div>
                <div class="stat-value">${commandsCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">MEMORY</div>
                <div class="stat-value">${usedMem} / ${totalMem} MB</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">STATUS</div>
                <div class="stat-value">⭕️PREDATORY</div>
            </div>
        </div>
        <div class="quote">${randomQuote}</div>
        <div class="contact">
            <a href="https://wa.me/254798841125" target="_blank">⌨️ CONTACT DEVELOPER</a>
        </div>
        <div class="footer">
            Inspired by Meryl | All Rights Reserved – SAVAGE-TECH
        </div>
    </div>
    <script>
        const messages = [
            "Savage core initialized",
            "Watching network",
            "Idle – awaiting command",
            "Scanning for threats",
            "Neural link active",
            "Purging irrelevant data",
            "Ready to execute"
        ];
        let i = 0;
        let j = 0;
        let isDeleting = false;
        let currentText = '';
        const statusEl = document.getElementById('status-text');
        function type() {
            const full = messages[i];
            if (isDeleting) {
                currentText = full.substring(0, j--);
                statusEl.textContent = currentText;
                if (j < 0) {
                    isDeleting = false;
                    i = (i + 1) % messages.length;
                    setTimeout(type, 300);
                } else {
                    setTimeout(type, 50);
                }
            } else {
                currentText = full.substring(0, j++);
                statusEl.textContent = currentText;
                if (j > full.length) {
                    isDeleting = true;
                    setTimeout(type, 1500);
                } else {
                    setTimeout(type, 80);
                }
            }
        }
        type();
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});
