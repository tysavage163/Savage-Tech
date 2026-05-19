require('dotenv').config();

const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found. Creating default .env file.');
    const defaultEnv = `# SAVAGE-TECH ENVIRONMENT VARIABLES
SESSION_ID=
PORT=3000
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created .env file. Please add your SESSION_ID and restart.');
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const http = require('http');
const url = require('url');
const os = require('os');
const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");

let temporarySock = null;

async function getPairingSocket() {
    if (global.sock && global.sock.user) {
        console.log("Using main bot socket for pairing");
        return global.sock;
    }
    if (temporarySock) return temporarySock;
    console.log("Creating temporary socket for pairing");
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["SΛVΛGΞ-TECH Pairing", "Chrome", "1.0.0"]
    });
    sock.ev.on('creds.update', saveCreds);
    temporarySock = sock;
    return sock;
}

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
    try {
        require('./bot.js');
    } catch (err) {
        console.error('Failed to start main bot:', err);
    }
}, 1000);

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    if (pathname === '/session') {
        const credsFile = path.join(__dirname, 'session', 'creds.json');
        if (!fs.existsSync(credsFile)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No session yet. Wait for bot to connect.');
            return;
        }
        const credsData = fs.readFileSync(credsFile);
        const sessionId = `SΛVΛGΞ-TECH;;;${credsData.toString('base64')}`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(sessionId);
        return;
    }

    if (pathname === '/code') {
        let num = parsedUrl.query.number;
        if (!num) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: "Number required" }));
            return;
        }
        num = num.replace(/[^0-9]/g, '');
        if (num.length < 9) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: "Invalid phone number (min 9 digits)" }));
            return;
        }
        try {
            const sock = await getPairingSocket();
            console.log(`Requesting pairing code for ${num}`);
            const code = await sock.requestPairingCode(num);
            console.log(`Pairing code generated: ${code}`);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ code: code }));
        } catch (err) {
            console.error("Pairing error:", err);
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: "Failed to get pairing code: " + err.message }));
        }
        return;
    }

    if (pathname === '/terminal') {
        const terminalHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Savage-Tech Terminal</title>
    <style>
        body { background: #0a0c12; color: #0f0; font-family: monospace; margin: 0; padding: 20px; }
        #terminal {
            background: #000;
            border: 1px solid #2a5f3e;
            height: 70vh;
            overflow-y: auto;
            padding: 10px;
            white-space: pre-wrap;
            font-size: 14px;
        }
        .input-line { display: flex; margin-top: 10px; }
        .input-line span { color: #0f0; }
        #command-input {
            background: #000;
            border: none;
            color: #0f0;
            font-family: monospace;
            font-size: 14px;
            flex: 1;
            outline: none;
        }
        .log-info { color: #0af; }
        .log-error { color: #f44; }
        .log-success { color: #4f4; }
        .log-message { color: #ffa500; }
    </style>
</head>
<body>
<div id="terminal">> Welcome to Savage-Tech Terminal\\n> Connecting...</div>
<div class="input-line"><span>$&nbsp;</span><input id="command-input" type="text" autofocus></div>
<script>
    const terminal = document.getElementById('terminal');
    const input = document.getElementById('command-input');
    let ws = null;

    function append(text, className = '') {
        const line = document.createElement('div');
        line.textContent = text;
        if (className) line.className = className;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }

    function connectWebSocket() {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(protocol + '//' + location.host + '/ws');
        ws.onopen = () => {
            append('> Terminal connected.', 'log-success');
            append('> Type "help" for commands.', 'log-info');
        };
        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'log') {
                append(data.message, data.level === 'error' ? 'log-error' : (data.level === 'success' ? 'log-success' : 'log-info'));
            } else if (data.type === 'message') {
                append('[MSG] ' + data.from + ': ' + data.text, 'log-message');
            }
        };
        ws.onclose = () => {
            append('> Disconnected. Reconnecting in 3s...', 'log-error');
            setTimeout(connectWebSocket, 3000);
        };
        ws.onerror = () => { append('> WebSocket error', 'log-error'); };
    }

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && ws && ws.readyState === WebSocket.OPEN) {
            const cmd = input.value.trim();
            if (cmd) {
                ws.send(cmd);
                append('> ' + cmd, 'log-info');
                input.value = '';
            }
        }
    });

    connectWebSocket();
</script>
</body>
</html>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(terminalHtml);
        return;
    }

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
        "Status: Predatory. All systems nominal."
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
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            background: #0b0f1c;
            font-family: 'Share Tech Mono', monospace;
            min-height:100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding:20px;
            position:relative;
        }
        body::before {
            content:"";
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background: url('https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/d565f511-d614-4bd8-87a6-2841dac051a9.png') no-repeat center center;
            background-size:cover;
            opacity:0.15;
            z-index:-1;
            pointer-events:none;
        }
        .terminal {
            max-width:800px;
            width:100%;
            background:rgba(5,8,15,0.85);
            border:1px solid #2a3f5e;
            border-radius:12px;
            padding:2rem;
            box-shadow:0 0 20px rgba(128,0,255,0.2), inset 0 0 10px rgba(128,0,255,0.05);
            backdrop-filter:blur(4px);
        }
        .header {
            font-size:2rem;
            font-weight:bold;
            letter-spacing:4px;
            color:#c0a0ff;
            text-shadow:0 0 5px #a0f,0 0 1px #a0f;
            border-bottom:2px solid #4a2f7a;
            padding-bottom:0.5rem;
            margin-bottom:1.2rem;
            display:flex;
            justify-content:space-between;
            align-items:flex-end;
            flex-wrap:wrap;
        }
        .header small { font-size:0.7rem; color:#8a6ab0; letter-spacing:1px; }
        .typewriter {
            margin:1rem 0 1.5rem 0;
            font-size:1rem;
            color:#c9aaff;
            background:#0a0e18;
            padding:0.6rem 1rem;
            border-left:3px solid #b77eff;
        }
        #status-text { font-weight:bold; color:#e4c4ff; }
        .cursor {
            display:inline-block;
            width:8px;
            margin-left:4px;
            background:#b77eff;
            animation:blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .stats-grid {
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
            gap:1.2rem;
            margin:2rem 0;
        }
        .stat-card {
            background:#0f1422;
            border-left:3px solid #b77eff;
            padding:0.8rem 1rem;
        }
        .stat-label { font-size:0.7rem; text-transform:uppercase; color:#9a7cc0; }
        .stat-value { font-size:1.3rem; font-weight:bold; color:#dbc8ff; word-break:break-word; }
        .quote {
            background:#0a0f1a;
            border-left:4px solid #ff4d4d;
            padding:1rem;
            margin:1.8rem 0;
            color:#bcc8e0;
        }
        .quote::before { content:"> "; color:#ff4d4d; }
        .contact { text-align:center; margin-top:2rem; }
        .contact a {
            display:inline-block;
            background:#1e1a3a;
            color:#cbbaff;
            text-decoration:none;
            padding:10px 28px;
            border-radius:40px;
            font-weight:bold;
            font-size:0.9rem;
            border:1px solid #8f6cc9;
            transition:0.2s;
            box-shadow:0 0 6px rgba(128,0,255,0.3);
        }
        .contact a:hover {
            background:#2f2a5a;
            box-shadow:0 0 14px #b77eff;
            color:white;
        }
        .footer {
            margin-top:2rem;
            text-align:center;
            font-size:0.65rem;
            color:#6a4c8a;
            border-top:1px solid #2a1e42;
            padding-top:1rem;
        }
        @media (max-width:550px){
            .terminal{padding:1.2rem;}
            .header{font-size:1.5rem;}
            .stat-value{font-size:1rem;}
        }
    </style>
</head>
<body>
<div class="terminal">
    <div class="header">SΛVΛGΞ-TECH <small>v2.0 // ACTIVE</small></div>
    <div class="typewriter"><span id="status-text"></span><span class="cursor">_</span></div>
    <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">HOST</div><div class="stat-value">${platform}</div></div>
        <div class="stat-card"><div class="stat-label">UPTIME</div><div class="stat-value">${uptime}</div></div>
        <div class="stat-card"><div class="stat-label">NODE.JS</div><div class="stat-value">${nodeVer}</div></div>
        <div class="stat-card"><div class="stat-label">COMMANDS</div><div class="stat-value">${commandsCount}</div></div>
        <div class="stat-card"><div class="stat-label">MEMORY</div><div class="stat-value">${usedMem} / ${totalMem} MB</div></div>
        <div class="stat-card"><div class="stat-label">STATUS</div><div class="stat-value">⭕️㊗️ PREDATORY</div></div>
    </div>
    <div class="quote">${randomQuote}</div>
    <div class="contact"><a href="https://wa.me/254798841125" target="_blank">⌨️ CONTACT DEVELOPER</a></div>
    <div class="footer">Inspired by Meryl | All Rights Reserved – SAVAGE-TECH</div>
</div>
<script>
    const messages=["Savage core initialized","Watching network","Idle – awaiting command","Scanning for threats","Neural link active","Purging irrelevant data","Ready to execute"];
    let i=0,j=0,isDeleting=false,currentText='',statusEl=document.getElementById('status-text');
    function type(){
        const full=messages[i];
        if(isDeleting){
            currentText=full.substring(0,j--);
            statusEl.textContent=currentText;
            if(j<0){isDeleting=false;i=(i+1)%messages.length;setTimeout(type,300);}
            else setTimeout(type,50);
        }else{
            currentText=full.substring(0,j++);
            statusEl.textContent=currentText;
            if(j>full.length){isDeleting=true;setTimeout(type,1500);}
            else setTimeout(type,80);
        }
    }
    type();
</script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

const wss = new WebSocket.Server({ server });
const wsClients = new Set();

wss.on('connection', (ws) => {
    wsClients.add(ws);
    ws.send(JSON.stringify({ type: 'log', message: 'Connected to Savage-Tech terminal', level: 'success' }));

    ws.on('message', async (message) => {
        const cmd = message.toString().trim();
        if (cmd === 'help') {
            ws.send(JSON.stringify({ type: 'log', message: 'Commands: pair <number> | session <base64> | status | restart', level: 'info' }));
        } else if (cmd.startsWith('pair ')) {
            const number = cmd.split(' ')[1];
            if (!number) {
                ws.send(JSON.stringify({ type: 'log', message: 'Usage: pair <phone number>', level: 'error' }));
                return;
            }
            ws.send(JSON.stringify({ type: 'log', message: `Requesting pairing code for ${number}...`, level: 'info' }));
            try {
                const sock = await getPairingSocket();
                const code = await sock.requestPairingCode(number);
                ws.send(JSON.stringify({ type: 'log', message: `Pairing code: ${code}. Enter it on your WhatsApp device.`, level: 'success' }));
            } catch (err) {
                ws.send(JSON.stringify({ type: 'log', message: `Pairing failed: ${err.message}`, level: 'error' }));
            }
        } else if (cmd.startsWith('session ')) {
            const sessionB64 = cmd.split(' ')[1];
            if (!sessionB64) {
                ws.send(JSON.stringify({ type: 'log', message: 'Usage: session <base64_session_id>', level: 'error' }));
                return;
            }
            try {
                const credsJson = Buffer.from(sessionB64, 'base64').toString('utf-8');
                const sessionDir = path.join(__dirname, 'session');
                if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
                fs.writeFileSync(path.join(sessionDir, 'creds.json'), credsJson);
                ws.send(JSON.stringify({ type: 'log', message: 'Session saved. Restarting bot...', level: 'success' }));
                setTimeout(() => process.exit(0), 500);
            } catch (err) {
                ws.send(JSON.stringify({ type: 'log', message: `Invalid session: ${err.message}`, level: 'error' }));
            }
        } else if (cmd === 'status') {
            const uptime = process.uptime();
            ws.send(JSON.stringify({ type: 'log', message: `Uptime: ${Math.floor(uptime)}s | Bot ${global.sock?.user ? 'connected' : 'disconnected'}`, level: 'info' }));
        } else if (cmd === 'restart') {
            ws.send(JSON.stringify({ type: 'log', message: 'Restarting...', level: 'info' }));
            setTimeout(() => process.exit(0), 500);
        } else {
            ws.send(JSON.stringify({ type: 'log', message: `Unknown command: ${cmd}. Type help`, level: 'error' }));
        }
    });

    ws.on('close', () => wsClients.delete(ws));
});

global.broadcastLog = (message, level = 'info') => {
    const data = JSON.stringify({ type: 'log', message, level });
    wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
};
global.broadcastMessage = (from, text) => {
    const data = JSON.stringify({ type: 'message', from, text });
    wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
};

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Web server running on port ${PORT} (0.0.0.0)`);
});
