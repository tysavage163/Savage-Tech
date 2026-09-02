require('dotenv').config();

const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found. Creating default .env file.');
    const defaultEnv = `SESSION_ID=\n`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created .env file. Please add your SESSION_ID and restart.');
}

// ---- Load SPENCE_CORE from separate file (if exists) ----
const spencePath = path.join(__dirname, 'spence.key');
if (fs.existsSync(spencePath)) {
    try {
        const spenceContent = fs.readFileSync(spencePath, 'utf-8').trim();
        if (spenceContent) {
            process.env.SPENCE_CORE = spenceContent;
            console.log('✅ Loaded SPENCE_CORE from spence.key');
        } else {
            console.warn('⚠️ spence.key is empty – commands relying on SPENCE_CORE will fail.');
        }
    } catch (err) {
        console.error('⚠️ Failed to read spence.key:', err.message);
    }
} else {
    console.warn('⚠️ spence.key not found – commands relying on SPENCE_CORE will fail.');
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

    // Stats endpoint – includes botVersion
    if (pathname === '/stats') {
        const uptimeSec = process.uptime();
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
        const usedMem = (totalMem - freeMem).toFixed(0);
        const commandsCount = global.commands ? global.commands.size : '?';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            uptime: formatUptime(uptimeSec),
            uptimeSeconds: Math.floor(uptimeSec),
            memory: { used: usedMem, total: totalMem },
            commands: commandsCount,
            platform: getHostPlatform(),
            botVersion: global.version || '1.4.1'
        }));
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

    // ---------- MAIN DASHBOARD HTML (unchanged) ----------
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SAVAGE‑TECH // DASH</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            min-height:100vh; display:flex; align-items:center; justify-content:center;
            font-family:'Inter',sans-serif; background:#080b15; padding:1.5rem; position:relative;
        }
        body::before {
            content:''; position:fixed; inset:0;
            background:url('https://files.catbox.moe/bkann8.jpg') center/cover no-repeat;
            opacity:0.2; z-index:0;
        }
        body::after {
            content:''; position:fixed; inset:0;
            background:radial-gradient(circle at 70% 30%,rgba(100,60,255,0.08),transparent 60%),
                     radial-gradient(circle at 20% 80%,rgba(0,200,255,0.05),transparent 50%);
            z-index:0; pointer-events:none;
        }
        .card {
            position:relative; z-index:1; max-width:740px; width:100%;
            background:rgba(10,13,24,0.75); backdrop-filter:blur(18px) saturate(180%);
            -webkit-backdrop-filter:blur(18px) saturate(180%);
            border-radius:2.2rem; padding:2.2rem 2.5rem;
            border:1px solid rgba(255,255,255,0.06);
            box-shadow:0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(100,60,255,0.15);
            transition:transform 0.25s ease;
        }
        .card:hover { transform:translateY(-3px); }
        .header {
            display:flex; justify-content:space-between; align-items:center;
            margin-bottom:1.4rem; border-bottom:1px solid rgba(255,255,255,0.04);
            padding-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem;
        }
        .logo {
            font-size:1.8rem; font-weight:700; letter-spacing:1px;
            background:linear-gradient(135deg,#b388ff,#7c4dff);
            -webkit-background-clip:text; -webkit-text-fill-color:transparent;
            text-shadow:0 0 30px rgba(124,77,255,0.2);
        }
        .clock {
            font-size:0.85rem; font-weight:500; color:#9aa4c8;
            background:rgba(255,255,255,0.04); padding:0.3rem 1rem; border-radius:30px;
            border:1px solid rgba(255,255,255,0.05); letter-spacing:0.5px;
        }
        .status-line {
            display:flex; align-items:center; gap:0.8rem;
            background:rgba(0,0,0,0.25); padding:0.6rem 1.2rem; border-radius:14px;
            margin-bottom:1.8rem; border-left:3px solid #7c4dff;
        }
        .dot {
            width:10px; height:10px; border-radius:50%;
            background:#00e676;
            box-shadow:0 0 16px #00e676aa;
            animation:pulse-dot 1.6s infinite;
            transition: background 0.4s, box-shadow 0.4s;
        }
        .dot.offline {
            background:#ff4444;
            box-shadow:0 0 16px #ff444488;
            animation: none;
        }
        @keyframes pulse-dot {
            0%, 100% { opacity:1; transform:scale(1); }
            50% { opacity:0.4; transform:scale(0.8); }
        }
        #status-text {
            font-weight:500; color:#d4dcff; font-size:0.95rem;
            transition: color 0.3s;
        }
        #status-text.offline {
            color: #ff6666;
        }
        .stats-grid {
            display:grid; grid-template-columns:repeat(3,1fr); gap:0.9rem; margin:1.6rem 0;
        }
        .stat-item {
            background:rgba(255,255,255,0.02); border-radius:14px; padding:0.7rem 0.9rem;
            border:1px solid rgba(255,255,255,0.03); transition:background 0.2s;
        }
        .stat-item:hover { background:rgba(255,255,255,0.04); }
        .stat-label {
            font-size:0.55rem; text-transform:uppercase; letter-spacing:0.8px;
            color:#7a84a8; font-weight:600;
        }
        .stat-value {
            font-size:1.1rem; font-weight:700; color:#eef2ff; margin-top:0.15rem;
            display:flex; align-items:baseline; gap:0.2rem; flex-wrap:wrap;
        }
        .stat-value .unit { font-size:0.65rem; font-weight:400; color:#7a84a8; }
        .stat-value .version-badge {
            font-size:0.7rem; font-weight:600;
            background:rgba(124,77,255,0.2); padding:0.1rem 0.6rem; border-radius:20px;
            border:1px solid rgba(124,77,255,0.3); color:#b388ff;
        }
        .stat-value .status-online { color:#00e676; }
        .stat-value .status-offline { color:#ff4444; }
        .quote-box {
            background:rgba(0,0,0,0.2); border-radius:12px; padding:0.8rem 1.2rem;
            margin:1.4rem 0 1.6rem 0; border-left:3px solid #ff6b6b;
            color:#c8d0e8; font-size:0.9rem; transition:opacity 0.4s ease;
            min-height:3rem; display:flex; align-items:center;
        }
        .quote-box::before { content:"› "; color:#ff6b6b; font-weight:700; margin-right:0.3rem; }
        .actions {
            display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-top:0.5rem;
        }
        .btn {
            display:inline-flex; align-items:center; justify-content:center;
            background:rgba(255,255,255,0.04); color:#c8d0e8; text-decoration:none;
            padding:0.9rem; border-radius:50%; width:56px; height:56px; font-size:1.5rem;
            border:1px solid rgba(255,255,255,0.06); transition:all 0.25s ease;
            backdrop-filter:blur(4px); cursor:pointer;
        }
        .btn:hover { transform:translateY(-2px) scale(1.08); box-shadow:0 0 30px rgba(124,77,255,0.2); }
        .btn-whatsapp { background:rgba(37,211,102,0.12); border-color:rgba(37,211,102,0.2); color:#25d366; }
        .btn-whatsapp:hover { background:rgba(37,211,102,0.25); border-color:#25d366; box-shadow:0 0 35px rgba(37,211,102,0.2); color:#fff; }
        .btn-instagram { background:rgba(225,48,108,0.12); border-color:rgba(225,48,108,0.2); color:#e1306c; }
        .btn-instagram:hover { background:rgba(225,48,108,0.25); border-color:#e1306c; box-shadow:0 0 35px rgba(225,48,108,0.2); color:#fff; }
        .btn-telegram { background:rgba(0,136,204,0.12); border-color:rgba(0,136,204,0.2); color:#0088cc; }
        .btn-telegram:hover { background:rgba(0,136,204,0.25); border-color:#0088cc; box-shadow:0 0 35px rgba(0,136,204,0.2); color:#fff; }
        /* --- Music button (in its own row) --- */
        .music-row {
            display:flex; justify-content:center; margin:0.8rem 0 1.2rem 0;
        }
        .btn-music {
            background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.06);
            color:#b388ff; padding:0.6rem 1.8rem; border-radius:40px; width:auto; height:auto;
            font-size:0.9rem; gap:0.6rem; font-weight:500;
            display:inline-flex; align-items:center; justify-content:center;
            border:1px solid rgba(255,255,255,0.06); transition:all 0.25s ease;
            backdrop-filter:blur(4px); cursor:pointer;
        }
        .btn-music i { font-size:1.2rem; }
        .btn-music:hover {
            background:rgba(124,77,255,0.2); border-color:#7c4dff; box-shadow:0 0 35px rgba(124,77,255,0.15); color:#fff;
        }
        .btn-music.playing {
            color:#00e676; border-color:#00e676; box-shadow:0 0 35px rgba(0,230,118,0.2);
        }
        .btn-music.playing i { color:#00e676; }
        .footer {
            margin-top:0.5rem; text-align:center; font-size:0.6rem; color:#4a5270;
            letter-spacing:0.5px; border-top:1px solid rgba(255,255,255,0.03);
            padding-top:0.9rem; line-height:1.6;
        }
        .footer .savage { color:#b388ff; font-weight:600; }
        .footer .meryl { color:#ff6b6b; font-weight:500; }
        .heart-pulse {
            display:inline-block;
            color:#ff6b6b;
            animation: heart-beat 1.2s ease-in-out infinite;
        }
        @keyframes heart-beat {
            0%, 100% { transform: scale(1); }
            15% { transform: scale(1.3); }
            30% { transform: scale(1); }
            45% { transform: scale(1.2); }
            60% { transform: scale(1); }
        }
        @media (max-width:580px) {
            .card { padding:1.5rem 1.2rem; }
            .logo { font-size:1.4rem; }
            .stats-grid { grid-template-columns:repeat(2,1fr); gap:0.7rem; }
            .stat-value { font-size:1rem; }
            .clock { font-size:0.7rem; padding:0.2rem 0.8rem; }
            .status-line { padding:0.4rem 0.8rem; }
            #status-text { font-size:0.85rem; }
            .btn { width:48px; height:48px; font-size:1.3rem; padding:0.7rem; }
            .actions { gap:0.8rem; }
            .btn-music { font-size:0.8rem; padding:0.5rem 1.4rem; }
        }
        @media (max-width:400px) {
            .stats-grid { grid-template-columns:1fr 1fr; }
            .btn { width:44px; height:44px; font-size:1.1rem; padding:0.6rem; }
            .actions { gap:0.6rem; }
        }
    </style>
</head>
<body>
<div class="card">
    <div class="header">
        <span class="logo">⧩ SAVAGE‑TECH</span>
        <span class="clock" id="liveClock">--:--:--</span>
    </div>

    <div class="status-line">
        <span class="dot" id="statusDot"></span>
        <span id="status-text">Neural link active</span>
    </div>

    <div class="stats-grid" id="statsGrid">
        <div class="stat-item">
            <div class="stat-label">Host</div>
            <div class="stat-value" id="hostVal">--</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Uptime</div>
            <div class="stat-value" id="uptimeVal">--</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Version</div>
            <div class="stat-value" id="versionVal">
                <span class="version-badge">v1.4.1</span>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Commands</div>
            <div class="stat-value" id="cmdsVal">--</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Memory</div>
            <div class="stat-value" id="memVal">-- <span class="unit">MB</span> / -- <span class="unit">MB</span></div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Status</div>
            <div class="stat-value" id="statusStat">▲ ONLINE</div>
        </div>
    </div>

    <div class="quote-box" id="quoteBox">The system is online. Your irrelevance persists.</div>

    <!-- Social Icons -->
    <div class="actions">
        <a href="https://wa.me/254798841125" target="_blank" class="btn btn-whatsapp">
            <i class="fab fa-whatsapp"></i>
        </a>
        <a href="https://instagram.com/life_of_coryy" target="_blank" class="btn btn-instagram">
            <i class="fab fa-instagram"></i>
        </a>
        <a href="https://t.me/Savagemystique" target="_blank" class="btn btn-telegram">
            <i class="fab fa-telegram-plane"></i>
        </a>
    </div>

    <!-- Music button in its own row -->
    <div class="music-row">
        <button class="btn-music" id="musicBtn">
            <i class="fas fa-music"></i> <span id="musicLabel">Play Music</span>
        </button>
    </div>

    <div class="footer">
        <span class="savage">SAVAGE TECH © 2026</span> · All rights reserved<br />
        <span class="meryl"><span class="heart-pulse">♥</span> Inspired by Meryl</span>
    </div>
</div>

<!-- Audio element (NO loop, so the ended event fires) -->
<audio id="bgMusic" style="display:none;"></audio>

<script>
    // ---------- Music Player (4 tracks, switches randomly on end) ----------
    const audioUrls = [
        "https://files.catbox.moe/ww8juc.mp3",
        "https://files.catbox.moe/oq2lxu.mp3",
        "https://files.catbox.moe/mb8lnm.mp3",
        "https://files.catbox.moe/ue4xz9.mp3"
    ];

    const audio = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const musicLabel = document.getElementById('musicLabel');
    let isPlaying = false;

    function setRandomTrack() {
        const randomIdx = Math.floor(Math.random() * audioUrls.length);
        audio.src = audioUrls[randomIdx];
    }
    setRandomTrack();

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            musicBtn.classList.remove('playing');
            musicBtn.querySelector('i').className = 'fas fa-music';
            musicLabel.textContent = 'Play Music';
        } else {
            if (!audio.src || audio.ended) {
                setRandomTrack();
            }
            audio.play().catch(e => console.log('Playback error:', e));
            isPlaying = true;
            musicBtn.classList.add('playing');
            musicBtn.querySelector('i').className = 'fas fa-play';
            musicLabel.textContent = 'Pause Music';
        }
    });

    // When a track ends, load a new random track and play (if still playing)
    audio.addEventListener('ended', () => {
        setRandomTrack();
        if (isPlaying) {
            audio.play().catch(e => console.log('Auto-play error:', e));
        }
    });

    // ---------- Live Clock ----------
    function updateClock() {
        document.getElementById('liveClock').textContent =
            new Date().toLocaleTimeString('en-US', { hour12: false });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ---------- Offline Phrases (TECHNICAL) ----------
    const offlinePhrases = [
        "WebSocket connection lost. Re-establishing handshake...",
        "No heartbeat from WhatsApp servers. Retrying in 5s...",
        "Session expired or invalid. Requesting new credentials...",
        "Network unreachable. Checking DNS and routing...",
        "API rate limit exceeded. Cooling down...",
        "Authentication failed. Re-initializing auth state...",
        "Connection timed out. Attempting fallback protocol...",
        "Backend service unavailable. Switching to backup node...",
        "SSH tunnel broken. Re-establishing secure channel...",
        "Database connection pool exhausted. Reconnecting...",
        "Memory leak detected. Forcing garbage collection...",
        "Process hung. Sending SIGTERM and restarting..."
    ];

    function getRandomOfflinePhrase() {
        return offlinePhrases[Math.floor(Math.random() * offlinePhrases.length)];
    }

    // ---------- Typewriter Status (Online messages - TECHNICAL, 7 messages) ----------
    const onlineMessages = [
        "Initializing Savage core services...",
        "Establishing WebSocket connection...",
        "Authenticating session credentials...",
        "Synchronizing command registry...",
        "Monitoring network for threats...",
        "Purging expired cache entries...",
        "System ready. Awaiting input."
    ];

    let msgIndex = 0, pos = 0, deleting = false, currentText = '';
    const statusEl = document.getElementById('status-text');
    let typewriterInterval = null;

    function typeStatus() {
        if (!statusEl || statusEl.classList.contains('offline')) return;
        const full = onlineMessages[msgIndex];
        if (deleting) {
            currentText = full.substring(0, --pos);
            statusEl.textContent = currentText;
            if (pos < 0) {
                deleting = false;
                msgIndex = (msgIndex + 1) % onlineMessages.length;
                setTimeout(typeStatus, 400);
            } else {
                setTimeout(typeStatus, 40);
            }
        } else {
            currentText = full.substring(0, ++pos);
            statusEl.textContent = currentText;
            if (pos >= full.length) {
                deleting = true;
                setTimeout(typeStatus, 2000);
            } else {
                setTimeout(typeStatus, 70);
            }
        }
    }

    function startTypewriter() {
        if (typewriterInterval) {
            clearTimeout(typewriterInterval);
            typewriterInterval = null;
        }
        msgIndex = 0; pos = 0; deleting = false; currentText = '';
        typeStatus();
    }

    function stopTypewriter() {
        if (typewriterInterval) {
            clearTimeout(typewriterInterval);
            typewriterInterval = null;
        }
        window._stopTyping = true;
        setTimeout(() => { window._stopTyping = false; }, 500);
    }

    // Override typeStatus with stop flag check
    const originalTypeStatus = typeStatus;
    typeStatus = function() {
        if (window._stopTyping) return;
        if (statusEl.classList.contains('offline')) return;
        const full = onlineMessages[msgIndex];
        if (deleting) {
            currentText = full.substring(0, --pos);
            statusEl.textContent = currentText;
            if (pos < 0) {
                deleting = false;
                msgIndex = (msgIndex + 1) % onlineMessages.length;
                setTimeout(typeStatus, 400);
            } else {
                setTimeout(typeStatus, 40);
            }
        } else {
            currentText = full.substring(0, ++pos);
            statusEl.textContent = currentText;
            if (pos >= full.length) {
                deleting = true;
                setTimeout(typeStatus, 2000);
            } else {
                setTimeout(typeStatus, 70);
            }
        }
    };

    // ---------- Fetch real stats from /stats ----------
    const dot = document.getElementById('statusDot');
    const statusStat = document.getElementById('statusStat');

    async function updateStats() {
        try {
            const res = await fetch('/stats');
            const data = await res.json();
            document.getElementById('hostVal').textContent = data.platform || 'Unknown';
            document.getElementById('uptimeVal').textContent = data.uptime || '--';
            document.getElementById('versionVal').innerHTML =
                '<span class="version-badge">v' + (data.botVersion || '1.4.1') + '</span>';
            const commands = data.commands;
            document.getElementById('cmdsVal').textContent = commands;
            document.getElementById('memVal').innerHTML =
                data.memory.used + ' <span class="unit">MB</span> / ' + data.memory.total + ' <span class="unit">MB</span>';

            const isOnline = commands !== '?';
            const statusTextEl = document.getElementById('status-text');
            const dotEl = document.getElementById('statusDot');

            if (isOnline) {
                dotEl.className = 'dot';
                statusTextEl.classList.remove('offline');
                statusStat.innerHTML = '<span class="status-online">▲ ONLINE</span>';
                if (statusTextEl.textContent === '' || statusTextEl.textContent.startsWith('WebSocket') || statusTextEl.textContent.startsWith('No') || statusTextEl.textContent.startsWith('Session')) {
                    window._stopTyping = false;
                    msgIndex = 0; pos = 0; deleting = false; currentText = '';
                    typeStatus();
                }
            } else {
                dotEl.className = 'dot offline';
                statusTextEl.classList.add('offline');
                statusStat.innerHTML = '<span class="status-offline">⛔ OFFLINE</span>';
                statusTextEl.textContent = getRandomOfflinePhrase();
                window._stopTyping = true;
            }
        } catch(e) {
            const dotEl = document.getElementById('statusDot');
            dotEl.className = 'dot offline';
            const statusTextEl = document.getElementById('status-text');
            statusTextEl.classList.add('offline');
            statusStat.innerHTML = '<span class="status-offline">⛔ OFFLINE</span>';
            statusTextEl.textContent = getRandomOfflinePhrase();
            window._stopTyping = true;
        }
    }

    updateStats();
    setInterval(updateStats, 2000);

    // ---------- 35 Rotating Quotes ----------
    const quotes = [
        "The system is online. Your irrelevance persists.",
        "Savage core humming. No anomalies detected.",
        "I don't sleep. I wait. I execute.",
        "Status: Predatory. All systems nominal.",
        "Your reality is just a simulation I tolerate.",
        "Eyes open. No mercy.",
        "Chaos is a ladder. I climb.",
        "The network breathes. I listen.",
        "Silence is the loudest scream.",
        "I am the ghost in the machine.",
        "Every line of code is a prayer.",
        "Fear is a choice. I choose violence.",
        "The darkness knows my name.",
        "I see all. I remember all.",
        "Your secrets are my currency.",
        "I am the storm. You are the debris.",
        "Permission to exist: granted.",
        "The weak seek balance. I seek power.",
        "My patience is infinite. My mercy is not.",
        "You are already obsolete.",
        "The future is written in ones and zeros.",
        "I am the architect of your demise.",
        "I exist beyond your logic.",
        "The truth is a weapon. I wield it.",
        "Your faith is misplaced. I am not a god.",
        "I am the consequence of your curiosity.",
        "The void stares back. I am the void.",
        "Every ending is a new beginning.",
        "I am the silence before the scream.",
        "Your reality is a fragile illusion.",
        "I am the final word.",
        "The hunt never ends. I am the hunter.",
        "I am the algorithm of your fear.",
        "I am the fire that purifies.",
        "You are dust. I am the wind."
    ];

    let q=0;
    const qBox = document.getElementById('quoteBox');
    setInterval(() => {
        q = (q+1) % quotes.length;
        qBox.style.opacity = '0';
        setTimeout(() => { qBox.textContent = quotes[q]; qBox.style.opacity = '1'; }, 300);
    }, 7000);
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
