const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const WebSocket = require('ws');

const PROXY_URL = global.PROXY_URL;

if (!PROXY_URL) {
    throw new Error('[COMMAND] FATAL: PROXY_URL is not set. Set global.PROXY_URL before requiring settings.js');
}

const C = {
    tag:     '\x1b[38;5;208m',
    info:    '\x1b[38;5;214m',
    success: '\x1b[38;5;114m',
    warn:    '\x1b[38;5;214m',
    error:   '\x1b[38;5;196m',
    dim:     '\x1b[38;5;240m',
    reset:   '\x1b[0m'
};

const TAG = `${C.tag}[COMMAND]${C.reset}`;

const DEFAULT_SETTINGS = {
    _schemaVersion: 2,
    _lastSync: 0,
    _installedVersion: null,
    _lastPushName: null,
    prefix: '.',
    worktype: 'public',
    antiDeleteEnabled: false,
    antiEditEnabled: false,
    antideleteMode: 'private',
    antiEditMode: 'private',
    antiViewOnce: false,
    autoViewStatus: 'off',
    autoTyping: 'off',
    autoRead: false,
    alwaysOnline: false,
    botFont: null,
    menuStyle: 'original',
    menuImages: [],
    menuImageIndex: 0,
    anticall: { mode: 'off', msg: '❌ Calls are not accepted.' },
    groups: {},
    warnings: {},
    chatbotEnabled: false,
    chatbotMode: 'dm',
    alwaysRecording: false,
    alwaysTypingRecording: false,
    autoReactStatus: 'off',
    autoReactStatusEmoji: '❤️',
    autoReactStatusMode: 'fixed',
    autoReact: 'off',
    autoReactEmoji: '❤️',
    // Dashboard command controls: absent/true means enabled; false disables execution.
    commandStates: {}
};

const SETTINGS_SCHEMA_VERSION = 2;

const MIGRATIONS = {
    2: (s) => {
        if (s.antideleteMode === 'on') s.antideleteMode = 'private';
        if (s.autoViewStatus === 'on') s.autoViewStatus = 'off';
        if (s.alwaysOnline === true) s.alwaysOnline = false;
        s._schemaVersion = 2;
        return s;
    }
};

function applyMigrations(s) {
    const from = s._schemaVersion || 1;
    if (from >= SETTINGS_SCHEMA_VERSION) return s;
    for (let v = from + 1; v <= SETTINGS_SCHEMA_VERSION; v++) {
        if (MIGRATIONS[v]) s = MIGRATIONS[v](s);
    }
    return s;
}

function normalizeSettings(s) {
    if (!s.groups || typeof s.groups !== 'object') s.groups = {};
    if (!s.warnings || typeof s.warnings !== 'object') s.warnings = {};
    if (!s.commandStates || typeof s.commandStates !== 'object' || Array.isArray(s.commandStates)) s.commandStates = {};
    return s;
}

let settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
let botId = null;
let sessionId = null;
let apiKey = null;
let dirty = false;
let dirtyVersion = 0;
let diskTimer = null;
let dbTimer = null;
let fastPullTimer = null;
let initialized = false;
let neuralSocket = null;
let neuralReconnectTimer = null;
let neuralReconnectDelay = 5000;
let neuralStopped = false;
let retryDelay = 60000;
const MAX_RETRY_DELAY = 15 * 60 * 1000;

const SESSION_DIR = path.join(process.cwd(), 'session');
const DISK_CACHE = path.join(SESSION_DIR, '.settings_cache.json');
const BOT_ID_FILE = path.join(SESSION_DIR, '.bot_id');
const API_KEY_FILE = path.join(SESSION_DIR, '.api_key');

function isShortToken(sid) {
    if (!sid || typeof sid !== 'string') return false;
    if (!sid.startsWith('Savage~')) return false;
    const afterPrefix = sid.slice(7);
    return afterPrefix.length > 0 && afterPrefix.length < 30;
}

async function fetchSessionFromNexus(token) {
    try {
        const res = await axios.get(`${PROXY_URL}/session/${encodeURIComponent(token)}`, { timeout: 15000 });
        if (res.data && res.data.success && res.data.sessionData) {
            return res.data.sessionData;
        }
    } catch (e) {
        console.error(`${TAG} ${C.error}❌ Session fetch failed: ${e.message}${C.reset}`);
    }
    return null;
}

function extractCredsJson(sid) {
    try {
        if (sid.includes('Savage~')) {
            const b64 = sid.split('Savage~')[1];
            return JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString());
        } else if (sid.includes(';;;')) {
            const b64 = sid.split(';;;')[1];
            return JSON.parse(Buffer.from(b64, 'base64').toString());
        } else {
            return JSON.parse(Buffer.from(sid, 'base64').toString());
        }
    } catch (e) {
        console.error(`${TAG} ${C.dim}SESSION_ID decode failed: ${e.message}${C.reset}`);
        return null;
    }
}

async function detectBotId() {
    let effectiveSid = process.env.SESSION_ID;

    if (effectiveSid && isShortToken(effectiveSid)) {
        const resolved = await fetchSessionFromNexus(effectiveSid);
        if (!resolved) {
            console.error(`${TAG} ${C.error}❌ Session ID could not be resolved${C.reset}`);
            return null;
        }

        const credsPath = path.join(SESSION_DIR, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            try {
                const b64 = resolved.split('Savage~')[1];
                const authData = zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf-8');
                JSON.parse(authData);
                if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
                fs.writeFileSync(credsPath, authData);
            } catch (e) {
                console.error(`${TAG} ${C.error}❌ Failed to cache session: ${e.message}${C.reset}`);
            }
        }

        sessionId = resolved;
    } else if (effectiveSid) {
        sessionId = effectiveSid;
    }

    const decodeTarget = sessionId || process.env.SESSION_ID;
    if (decodeTarget) {
        const credsJson = extractCredsJson(decodeTarget);
        if (credsJson) {
            const rawId = credsJson?.me?.id || credsJson?.me?.jid;
            if (rawId) {
                const id = rawId.split(':')[0].split('@')[0];
                if (/^\d{7,15}$/.test(id)) {
                    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
                    fs.writeFileSync(BOT_ID_FILE, id);
                    return id;
                }
            }
        }
        console.error(`${TAG} ${C.error}❌ Failed to decode SESSION_ID${C.reset}`);
    }

    const credsPath = path.join(SESSION_DIR, 'creds.json');
    if (fs.existsSync(credsPath)) {
        try {
            const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            const rawId = creds?.me?.id || creds?.me?.jid;
            if (rawId) {
                const id = rawId.split(':')[0].split('@')[0];
                if (/^\d{7,15}$/.test(id)) {
                    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
                    fs.writeFileSync(BOT_ID_FILE, id);
                    return id;
                }
            }
        } catch (e) {}
    }

    if (fs.existsSync(BOT_ID_FILE)) {
        try {
            const id = fs.readFileSync(BOT_ID_FILE, 'utf8').trim();
            if (/^\d{7,15}$/.test(id)) return id;
        } catch (e) {}
    }

    console.log(`${TAG} ${C.warn}⚠️  No session credentials available${C.reset}`);
    return null;
}

function computeProof(id, sid) {
    return crypto.createHash('sha256').update(`${id}:::${sid}`).digest('hex');
}

function loadApiKey() {
    if (fs.existsSync(API_KEY_FILE)) {
        try { return fs.readFileSync(API_KEY_FILE, 'utf8').trim(); } catch (e) {}
    }
    return null;
}

function saveApiKey(key) {
    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
    fs.writeFileSync(API_KEY_FILE, key);
}

function loadFromDisk() {
    if (fs.existsSync(DISK_CACHE)) {
        try {
            const data = JSON.parse(fs.readFileSync(DISK_CACHE, 'utf8'));
            settings = normalizeSettings(applyMigrations({ ...DEFAULT_SETTINGS, ...data }));
            console.log(`${TAG} ${C.dim}🗄️  Vault cache loaded${C.reset}`);
            return true;
        } catch (e) {
            console.error(`${TAG} ${C.error}❌ Vault cache corrupted: ${e.message}${C.reset}`);
        }
    }
    return false;
}

function saveToDisk() {
    try {
        if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
        fs.writeFileSync(DISK_CACHE, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error(`${TAG} ${C.error}❌ Vault write failed: ${e.message}${C.reset}`);
    }
}

async function registerWithProxy() {
    if (!botId || !sessionId) {
        console.log(`${TAG} ${C.warn}⚠️  Registration blocked — missing credentials${C.reset}`);
        return false;
    }

    try {
        const proof = computeProof(botId, sessionId);
        const cachedPushName = settings._lastPushName || null;
        const res = await axios.post(
            `${PROXY_URL}/register`,
            { botId, proof, sessionId, pushName: cachedPushName },
            { timeout: 15000 }
        );
        apiKey = res.data.apiKey;
        saveApiKey(apiKey);
        console.log(`${TAG} ${C.success}🔗 Nexus link established${C.reset}`);
        return true;
    } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
            const msg = err.response?.data?.error || 'operator mismatch';
            console.error(`${TAG} ${C.error}⛔ Nexus rejected — ${msg}${C.reset}`);
        } else {
            console.error(`${TAG} ${C.error}❌ Nexus link failed: ${err.message}${C.reset}`);
        }
        return false;
    }
}

async function fetchSettingsFromProxy() {
    try {
        const res = await axios.get(`${PROXY_URL}/settings`, {
            headers: { 'x-api-key': apiKey },
            timeout: 15000
        });
        return res.data.settings || null;
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log(`${TAG} ${C.warn}⚠️  Access key revoked — re-linking...${C.reset}`);
            apiKey = null;
            if (fs.existsSync(API_KEY_FILE)) fs.unlinkSync(API_KEY_FILE);
            const e = new Error('Access key revoked');
            e.revoked = true;
            throw e;
        }
        throw err;
    }
}

async function pushSettingsToProxy() {
    if (!apiKey) return false;
    try {
        const response = await axios.post(`${PROXY_URL}/settings`, { settings }, {
            headers: { 'x-api-key': apiKey },
            timeout: 15000
        });
        return response.data?.success !== false;
    } catch (err) {
        console.error(`${TAG} ${C.error}❌ Nexus uplink failed: ${err.message}${C.reset}`);
        return false;
    }
}

async function fetchUsersFromProxy() {
    try {
        const res = await axios.get(`${PROXY_URL}/users`, {
            headers: { 'x-api-key': apiKey },
            timeout: 15000
        });
        return res.data.users || null;
    } catch (err) {
        console.error(`${TAG} ${C.dim}users fetch failed: ${err.message}${C.reset}`);
        return null;
    }
}

async function pushUsersToProxy(ownerJid, sudoUsers) {
    try {
        await axios.post(`${PROXY_URL}/users`, { ownerJid, sudoUsers }, {
            headers: { 'x-api-key': apiKey },
            timeout: 15000
        });
        return true;
    } catch (err) {
        console.error(`${TAG} ${C.error}❌ Operator sync failed: ${err.message}${C.reset}`);
        return false;
    }
}

async function updatePushName(pushName) {
    if (!pushName || typeof pushName !== 'string' || !pushName.trim()) return false;
    pushName = pushName.trim().slice(0, 100);
    // Never publish a phone number/JID as the bot's display name.
    if (/^\+?[0-9][0-9\s().-]*$/.test(pushName) || /^[0-9]+@(s\.whatsapp\.net|lid)$/.test(pushName)) return false;
    settings._lastPushName = pushName;
    markDirty();

    if (!apiKey) return false;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await axios.post(`${PROXY_URL}/pushname`, { pushName }, {
                headers: { 'x-api-key': apiKey },
                timeout: 10000
            });
            if (res.data?.success) return true;
        } catch (err) {
            const status = err.response?.status;
            if (status === 403 && attempt === 1) {
                try {
                    const ok = await registerWithProxy();
                    if (ok) continue;
                } catch (e) {}
            }
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    return false;
}

async function logCommand(payload) {
    if (!apiKey || !initialized) return false;
    try {
        await axios.post(`${PROXY_URL}/commandlog`, payload, {
            headers: { 'x-api-key': apiKey },
            timeout: 5000
        });
        return true;
    } catch (err) {
        return false;
    }
}

async function processOutbox(sock) {
    if (!apiKey || !initialized) return 0;
    if (!sock || !sock.user) return 0;
    try {
        const res = await axios.get(`${PROXY_URL}/outbox`, {
            headers: { 'x-api-key': apiKey },
            timeout: 10000
        });
        const items = res.data?.items || [];
        let sent = 0;
        for (const item of items) {
            try {
                await sock.sendMessage(item.to, { text: item.text });
                await axios.post(`${PROXY_URL}/outbox/${item._id}/ack`, {}, {
                    headers: { 'x-api-key': apiKey },
                    timeout: 5000
                });
                sent++;
            } catch (e) {}
        }
        return sent;
    } catch (e) {
        return 0;
    }
}

async function recordFlight(payload) {
    if (!apiKey || !initialized) return false;
    try {
        const res = await axios.post(`${PROXY_URL}/blackbox/record`, payload, {
            headers: { 'x-api-key': apiKey },
            timeout: 10000
        });
        return res.data.logged === true;
    } catch (err) {
        return false;
    }
}

async function fetchFlight(msgId) {
    if (!apiKey || !initialized) return null;
    try {
        const res = await axios.get(`${PROXY_URL}/blackbox/${msgId}`, {
            headers: { 'x-api-key': apiKey },
            timeout: 10000
        });
        return res.data.hit ? res.data.flight : null;
    } catch (err) {
        return null;
    }
}

async function purgeBlackbox() {
    if (!apiKey || !initialized) return 0;
    try {
        const res = await axios.post(`${PROXY_URL}/blackbox/purge`, {}, {
            headers: { 'x-api-key': apiKey },
            timeout: 15000
        });
        return res.data.purged || 0;
    } catch (err) {
        return 0;
    }
}

async function checkPendingPull() {
    if (!apiKey || !initialized) return false;
    try {
        const res = await axios.get(`${PROXY_URL}/pull`, {
            headers: { 'x-api-key': apiKey },
            timeout: 10000
        });
        if (!res.data || !res.data.changed) return false;
        const remote = res.data.settings;
        if (remote && typeof remote === 'object') {
            settings = normalizeSettings(applyMigrations({ ...DEFAULT_SETTINGS, ...remote, _lastPushName: settings._lastPushName }));
            saveToDisk();
            console.log(`${TAG} ${C.info}⬇️  Pulled live settings from Nexus${C.reset}`);

            try { syncGlobals(); } catch (e) {}

            if (typeof global.syncBotGlobals === 'function') {
                try { global.syncBotGlobals(); } catch (e) {}
            }

            try {
                const users = await fetchUsersFromProxy();
                if (users) {
                    const oldCount = (global.sudoUsers || []).length;
                    global.ownerJid = users.ownerJid || global.ownerJid;
                    global.owner = [global.ownerJid].filter(Boolean);
                    global.sudoUsers = users.sudoUsers || [];
                    if (global.sudoUsers.length !== oldCount) {
                        console.log(`${TAG} ${C.info}🛡️  Sudo list refreshed: ${oldCount} → ${global.sudoUsers.length}${C.reset}`);
                    }
                }
            } catch (e) {}

            if (typeof global.settings !== 'undefined') {
                global.settings = module.exports;
            }
            return true;
        }
    } catch (err) {}
    return false;
}

function reportNeuralResult(jobId, status, message) {
    if (!jobId || !apiKey) return;
    if (neuralSocket && neuralSocket.readyState === WebSocket.OPEN) {
        neuralSocket.send(JSON.stringify({ type: 'sync-result', jobId, status, message }));
        return;
    }
    axios.post(`${PROXY_URL}/api/v1/bots/${encodeURIComponent(botId)}/sync-result`, { jobId, status, message }, { headers: { 'x-api-key': apiKey }, timeout: 8000 }).catch(() => {});
}
async function handleNeuralCommand(message) {
    const { action, payload = {} } = message || {};
    const jobId = payload.jobId;
    try {
        if (action === 'NEURAL_PULL') {
            const applied = await checkPendingPull();
            reportNeuralResult(jobId, applied ? 'applied' : 'failed', applied ? 'Remote settings applied' : 'No pending settings were available or settings could not be applied');
        } else if (action === 'NEURAL_SYNC') {
            const ok = await forceSync();
            reportNeuralResult(jobId, ok ? 'applied' : 'failed', ok ? 'Current bot settings pushed to proxy' : 'Settings push failed');
        } else {
            reportNeuralResult(jobId, 'failed', 'Unsupported command');
        }
    } catch (error) {
        reportNeuralResult(jobId, 'failed', error.message || 'Command failed');
    }
}
function connectNeuralSocket() {
    if (neuralStopped || !initialized || !apiKey || neuralSocket) return;
    const base = PROXY_URL.replace(/^http/i, 'ws').replace(/\/$/, '');
    const url = `${base}/neural?key=${encodeURIComponent(apiKey)}`;
    let ws;
    try { ws = new WebSocket(url, { handshakeTimeout: 12000, perMessageDeflate: false }); }
    catch (e) { scheduleNeuralReconnect(); return; }
    neuralSocket = ws;
    ws.on('open', () => { neuralReconnectDelay = 5000; console.log(`${TAG} ${C.success}🧠 Neural control channel connected${C.reset}`); });
    ws.on('message', raw => {
        try { const msg = JSON.parse(raw.toString()); if (msg.type === 'command') handleNeuralCommand(msg); }
        catch (e) { console.warn(`${TAG} Invalid neural command: ${e.message}`); }
    });
    ws.on('close', () => { if (neuralSocket === ws) neuralSocket = null; scheduleNeuralReconnect(); });
    ws.on('error', () => { try { ws.close(); } catch (e) {} });
}
function scheduleNeuralReconnect() {
    if (neuralStopped || neuralReconnectTimer || !initialized) return;
    const jitter = Math.floor(Math.random() * 2000);
    neuralReconnectTimer = setTimeout(() => { neuralReconnectTimer = null; connectNeuralSocket(); }, neuralReconnectDelay + jitter);
    neuralReconnectDelay = Math.min(neuralReconnectDelay * 2, 5 * 60 * 1000);
}

async function initDatabase() {
    botId = await detectBotId();
    if (!sessionId) sessionId = process.env.SESSION_ID || null;

    if (!botId || !sessionId) {
        console.log(`${TAG} ${C.warn}👻 Ghost mode — retry in ${Math.round(retryDelay / 1000)}s${C.reset}`);
        startDiskFlusher();
        setTimeout(initDatabase, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
        return;
    }

    loadFromDisk();
    apiKey = loadApiKey();

    if (!apiKey) {
        console.log(`${TAG} ${C.info}Establishing secure channel to Nexus...${C.reset}`);
        const ok = await registerWithProxy();
        if (!ok) {
            console.log(`${TAG} ${C.warn}⚠️  Nexus unreachable — retry in ${Math.round(retryDelay / 1000)}s${C.reset}`);
            startDiskFlusher();
            setTimeout(initDatabase, retryDelay);
            retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
            return;
        }
    }

    try {
        const proxySettings = await fetchSettingsFromProxy();
        if (proxySettings) {
            settings = normalizeSettings(applyMigrations({
                ...DEFAULT_SETTINGS,
                ...proxySettings,
                _lastPushName: settings._lastPushName
            }));
            console.log(`${TAG} ${C.success}📡 Core intel loaded from Nexus${C.reset}`);
            saveToDisk();
        } else {
            settings._lastSync = Date.now();
            await pushSettingsToProxy();
        }

        if (settings._lastPushName && apiKey) {
            try {
                await axios.post(`${PROXY_URL}/pushname`, { pushName: settings._lastPushName }, {
                    headers: { 'x-api-key': apiKey },
                    timeout: 10000
                });
            } catch (e) {}
        }

        console.log(`${TAG} ${C.success}🥷  User verified${C.reset}`);
        console.log(`${TAG} ${C.success}✅ Systems online${C.reset}`);
        console.log(`${TAG} ${C.success}📱 User ${C.tag}${botId}${C.reset}`);

        startDiskFlusher();
        startDbSyncer();
        initialized = true;
        retryDelay = 60000;
        connectNeuralSocket();
    } catch (err) {
        console.error(`${TAG} ${C.error}❌ Nexus offline: ${err.message}${C.reset}`);
        console.log(`${TAG} ${C.warn}👻 Ghost mode — running from vault${C.reset}`);
        startDiskFlusher();
        setTimeout(initDatabase, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    }
}

async function syncToDb() {
    if (!initialized || !apiKey || !dirty) return false;

    const snapshotVersion = dirtyVersion;
    const previousSync = settings._lastSync;
    try {
        const pushed = await pushSettingsToProxy();
        if (!pushed) {
            settings._lastSync = previousSync;
            return false;
        }
        settings._lastSync = Date.now();
        saveToDisk();
        if (dirtyVersion === snapshotVersion) dirty = false;
        return true;
    } catch (err) {
        settings._lastSync = previousSync;
        console.error(`${TAG} ${C.error}❌ Uplink failed: ${err.message}${C.reset}`);
        return false;
    }
}

async function forceSync() {
    // The neural command handler must receive the real uplink result.
    // Previously this function discarded syncToDb()'s boolean result, so
    // successful individual NEURAL_SYNC jobs were incorrectly acknowledged
    // as failed (undefined is treated as false).
    dirty = true;
    dirtyVersion++;
    return await syncToDb();
}

function startDiskFlusher() {
    if (diskTimer) clearInterval(diskTimer);
    diskTimer = setInterval(() => {
        if (dirty) saveToDisk();
    }, 5000);
}

function startDbSyncer() {
    if (dbTimer) clearInterval(dbTimer);
    if (fastPullTimer) clearInterval(fastPullTimer);

    // Settings push/pull cadence: every four hours.
    const SYNC_INTERVAL_MS = 4 * 60 * 60 * 1000;

    fastPullTimer = setInterval(async () => {
        try { await checkPendingPull(); } catch (e) {}
    }, SYNC_INTERVAL_MS);

    dbTimer = setInterval(async () => {
        await syncToDb();
    }, SYNC_INTERVAL_MS);
}

function markDirty() {
    dirty = true;
    dirtyVersion++;
    settings._lastSync = Date.now();
}

function loadSettings() { return settings; }
function saveSettings() { markDirty(); saveToDisk(); }

function getGlobal(key, defaultValue = null) {
    return settings[key] !== undefined ? settings[key] : defaultValue;
}

function setGlobal(key, value) {
    settings[key] = value;
    markDirty();
}

function getGroup(groupId, key, defaultValue = null) {
    if (!settings.groups[groupId]) settings.groups[groupId] = {};
    return settings.groups[groupId][key] !== undefined
        ? settings.groups[groupId][key]
        : defaultValue;
}

function setGroup(groupId, key, value) {
    if (!settings.groups[groupId]) settings.groups[groupId] = {};
    settings.groups[groupId][key] = value;
    markDirty();
}

function loadAllGroupSettings(groupId) {
    return settings.groups[groupId] || {};
}

function getWarning(groupId, userId, type) {
    return settings.warnings?.[groupId]?.[userId]?.[type] || 0;
}

function setWarning(groupId, userId, type, count) {
    if (!settings.warnings[groupId]) settings.warnings[groupId] = {};
    if (!settings.warnings[groupId][userId]) settings.warnings[groupId][userId] = {};

    if (count <= 0) {
        delete settings.warnings[groupId][userId][type];
        if (Object.keys(settings.warnings[groupId][userId]).length === 0) delete settings.warnings[groupId][userId];
        if (Object.keys(settings.warnings[groupId]).length === 0) delete settings.warnings[groupId];
    } else {
        settings.warnings[groupId][userId][type] = count;
    }
    markDirty();
}

function incrementWarning(groupId, userId, type) {
    const current = getWarning(groupId, userId, type);
    const newCount = current + 1;
    setWarning(groupId, userId, type, newCount);
    return newCount;
}

function resetWarnings(groupId, userId, type) { setWarning(groupId, userId, type, 0); }
function loadAllWarnings(groupId) { return settings.warnings[groupId] || {}; }

function syncGlobals() {
    for (const key in settings) {
        if (key !== 'groups' && key !== 'warnings' && !key.startsWith('_')) {
            global[key] = settings[key];
        }
    }
}

function syncGroupGlobals() {
    if (!global.antiLink) global.antiLink = {};
    if (!global.antiLinkConfig) global.antiLinkConfig = {};
    if (!global.antiLinkWarnings) global.antiLinkWarnings = {};

    if (!global.antiSpamConfig) global.antiSpamConfig = {};
    if (!global.antiSpamWarnings) global.antiSpamWarnings = {};
    if (!global.antiSpamTrack) global.antiSpamTrack = {};

    if (!global.antiSticker) global.antiSticker = {};
    if (!global.antiStickerWarnings) global.antiStickerWarnings = {};

    if (!global.badWords) global.badWords = {};
    if (!global.badWordConfig) global.badWordConfig = {};
    if (!global.badWordEnabled) global.badWordEnabled = {};
    if (!global.badWordWarnings) global.badWordWarnings = {};
    if (!global.antiBot) global.antiBot = {};
    if (!global.antiForwardConfig) global.antiForwardConfig = {};
    if (!global.antiForwardWarnings) global.antiForwardWarnings = {};
    if (!global.antiLeave) global.antiLeave = {};
    if (!global.antiTagConfig) global.antiTagConfig = {};
    if (!global.antiTagWarnings) global.antiTagWarnings = {};
    if (!global.antiTagAdminConfig) global.antiTagAdminConfig = {};
    if (!global.antiTagAdminWarnings) global.antiTagAdminWarnings = {};
    if (!global.welcomeEnabled) global.welcomeEnabled = {};
    if (!global.goodbyeEnabled) global.goodbyeEnabled = {};
    if (!global.powerplayEnabled) global.powerplayEnabled = {};

    const groups = settings.groups || {};
    for (const groupId of Object.keys(groups)) {
        const g = groups[groupId] || {};

        const alConfig = g.antiLinkConfig || g.antiLink;
        if (alConfig && typeof alConfig === 'object') {
            global.antiLinkConfig[groupId] = alConfig;
            global.antiLink[groupId] = !!alConfig.enabled;
        }
        if (g.antiLinkWarnings) global.antiLinkWarnings[groupId] = g.antiLinkWarnings;
        if (g.antiSpamConfig) global.antiSpamConfig[groupId] = g.antiSpamConfig;
        if (g.antiSpamWarnings) global.antiSpamWarnings[groupId] = g.antiSpamWarnings;
        if (g.antiSticker) global.antiSticker[groupId] = g.antiSticker;
        if (g.antiStickerWarnings) global.antiStickerWarnings[groupId] = g.antiStickerWarnings;

        if (g.badWords) global.badWords[groupId] = new Set(Array.isArray(g.badWords) ? g.badWords : []);
        if (g.badWordConfig) global.badWordConfig[groupId] = g.badWordConfig;
        if (g.badWordEnabled !== undefined) global.badWordEnabled[groupId] = g.badWordEnabled;
        if (g.badWordWarnings) global.badWordWarnings[groupId] = g.badWordWarnings;

        if (g.antiBot !== undefined) global.antiBot[groupId] = g.antiBot;

        if (g.antiForwardConfig) global.antiForwardConfig[groupId] = g.antiForwardConfig;
        if (g.antiForwardWarnings) global.antiForwardWarnings[groupId] = g.antiForwardWarnings;

        if (g.antiLeave !== undefined) global.antiLeave[groupId] = g.antiLeave;

        if (g.antiTagConfig) global.antiTagConfig[groupId] = g.antiTagConfig;
        if (g.antiTagWarnings) global.antiTagWarnings[groupId] = g.antiTagWarnings;

        if (g.antiTagAdminConfig) global.antiTagAdminConfig[groupId] = g.antiTagAdminConfig;
        if (g.antiTagAdminWarnings) global.antiTagAdminWarnings[groupId] = g.antiTagAdminWarnings;

        if (g.welcomeEnabled !== undefined) global.welcomeEnabled[groupId] = g.welcomeEnabled;
        if (g.goodbyeEnabled !== undefined) global.goodbyeEnabled[groupId] = g.goodbyeEnabled;
        if (g.powerplayEnabled !== undefined) global.powerplayEnabled[groupId] = g.powerplayEnabled;
    }
}

async function setBotIdFromWhatsApp(whatsappJid) {
    if (!whatsappJid) return false;
    const realId = whatsappJid.split(':')[0].split('@')[0];
    if (!realId) return false;

    if (realId === botId) {
        console.log(`${TAG} ${C.success}🥷  User verified${C.reset}`);
        return false;
    }

    console.log(`${TAG} ${C.info}User switched: ${botId} → ${realId}${C.reset}`);

    const oldBotId = botId;
    const oldApiKey = apiKey;
    const oldKeyFile = fs.existsSync(API_KEY_FILE) ? fs.readFileSync(API_KEY_FILE, 'utf8') : null;

    botId = realId;
    apiKey = null;
    if (fs.existsSync(API_KEY_FILE)) fs.unlinkSync(API_KEY_FILE);

    const ok = await registerWithProxy();
    if (!ok) {
        console.log(`${TAG} ${C.warn}↩️  Registration failed — rolling back to ${oldBotId}${C.reset}`);
        botId = oldBotId;
        apiKey = oldApiKey;
        if (oldKeyFile !== null) saveApiKey(oldKeyFile);
        return false;
    }

    fs.writeFileSync(BOT_ID_FILE, realId);
    settings._lastSync = Date.now();
    await pushSettingsToProxy();
    console.log(`${TAG} ${C.success}✅ Migrated to user ${realId}${C.reset}`);
    return true;
}

async function gracefulShutdown() {
    neuralStopped = true;
    if (neuralReconnectTimer) clearTimeout(neuralReconnectTimer);
    if (neuralSocket) { try { neuralSocket.close(1000, 'Bot shutting down'); } catch (e) {} neuralSocket = null; }
    if (diskTimer) clearInterval(diskTimer);
    if (dbTimer) clearInterval(dbTimer);
    if (fastPullTimer) clearInterval(fastPullTimer);
    saveToDisk();
    await syncToDb();
}

process.on('SIGTERM', async () => { await gracefulShutdown(); process.exit(0); });
process.on('SIGINT', async () => { await gracefulShutdown(); process.exit(0); });

const _exports = {
    initDatabase,
    loadSettings,
    saveSettings,
    getGlobal,
    setGlobal,
    getGroup,
    setGroup,
    loadAllGroupSettings,
    getWarning,
    setWarning,
    incrementWarning,
    resetWarnings,
    loadAllWarnings,
    syncGlobals,
    syncGroupGlobals,
    forceSync,
    checkPendingPull,
    getBotId: () => botId,
    getApiKey: () => apiKey,
    fetchUsersFromProxy,
    pushUsersToProxy,
    updatePushName,
    logCommand,
    processOutbox,
    setBotIdFromWhatsApp,
    recordFlight,
    fetchFlight,
    purgeBlackbox,
    get settings() { return settings; }
};

module.exports = _exports;
