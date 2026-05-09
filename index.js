const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const path = require("path");
const os = require("os");

// ===== 1. CORE SYSTEM SETTINGS =====
global.prefix = ".";
global.commands = new Map();
global.blacklist = new Set();
global.antideleteMode = "on";
global.autoViewStatus = "on";
global.autoTyping = "off";
global.worktype = "public";

global.messageCounts = {};
global.lastMessageTime = {};
global.antideleteOwnerChat = null;
global.goodbyeEnabled = {};
global.welcomeEnabled = {};

global.antiLink = {};
global.violationWarnings = {};

// ===== LEVEL 2 ANTI-DELETE CACHE =====
global._msgCache = new Map();
global._mediaCache = new Map();

// ===== ANTI-STATUSMENTION CACHE =====
global.antiStatusMention = {};
global.statusWarnings = {};

// ===== ALWAYS-RECORDING =====
global.alwaysRecording = false;

// ===== SUPPORT LINKS =====
const SUPPORT_GROUP_LINK = "https://chat.whatsapp.com/LqkRYXP52tR3CKR8rkKNoh?mode=gi_t";
const SUPPORT_CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCuEBJEAKWOWVH3G21e";

function getHostPlatform() {
if (process.env.DYNO) return 'Heroku (Dyno)';
if (process.env.RENDER) return 'Render';
if (process.env.VERCEL) return 'Vercel';
if (process.env.KOYEB) return 'Koyeb';
if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
if (process.env.REPLIT_DB_URL) return 'Replit';
if (process.env.COOLIFY) return 'Coolify';
if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux (Android)';
if (os.platform() === 'linux') return 'Linux VPS';
if (os.platform() === 'win32') return 'Windows';
if (os.platform() === 'darwin') return 'macOS';
return 'Unknown / Local';
}

// ===== STATUS QUOTES =====
const warning1Quotes = [
"You just broke a rule Spencer wrote to protect this place.",
"Spencer didn't code this bot for chaos. Respect the rules.",
"Think before you type. Spencer designed this group for order.",
"Disobedience logged. Spencer's algorithms are watching.",
"You have been noted. Spencer's system never forgets."
];

const warning2Quotes = [
"Another violation. Spencer's patience is not infinite.",
"Rules are written in code. You triggered an error.",
"Spencer's bot doesn't forgive mistakes twice.",
"Stop now. Next step is removal."
];

const finalQuotes = [
"You don't have the clearance. Try again when you're Spencer or my host.",
"Nice try. This console is locked to Spencer or my host only.",
"Your authority is denied. System rejects you.",
"Only Spencer or my host may proceed. You are irrelevant."
];

// ===== ADMIN CHECK (FIXED PROPERLY) =====
async function checkAdmin(sock, groupId, sender) {
try {
const meta = await sock.groupMetadata(groupId);
const participant = meta.participants.find(p => p.id === sender);
return participant?.admin === "admin" || participant?.admin === "superadmin";
} catch {
return false;
}
}

// ===== ANTI STATUSMENTION HANDLER =====
async function handleStatus(sock, msg, from, sender, isAdmin) {
if (!from.endsWith("@g.us")) return;
if (!global.antiStatusMention[from]) return;

// ignore admins
if (isAdmin) return;

const text =
msg.message?.conversation ||
msg.message?.extendedTextMessage?.text ||
"";

const mentions =
msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

// ignore @all / @everyone
if (text.includes("@all") || text.includes("@everyone")) return;

if (!mentions.length) return;

// warning tracking
if (!global.statusWarnings[from]) global.statusWarnings[from] = {};
const count = (global.statusWarnings[from][sender] || 0) + 1;
global.statusWarnings[from][sender] = count;

// delete message
try {
await sock.sendMessage(from, { delete: msg.key });
} catch {}

let quote;

if (count === 1) quote = warning1Quotes[Math.floor(Math.random() * warning1Quotes.length)];
else if (count === 2) quote = warning2Quotes[Math.floor(Math.random() * warning2Quotes.length)];
else quote = finalQuotes[Math.floor(Math.random() * finalQuotes.length)];

await sock.sendMessage(from, {
text: `🚨 @${sender.split("@")[0]}\n\n${quote}`,
mentions: [sender]
});

if (count >= 3) {
try {
await sock.groupParticipantsUpdate(from, [sender], "remove");
} catch {}
delete global.statusWarnings[from][sender];
}
}

const loadCommands = () => {
global.commands.clear();
if (!fs.existsSync("./commands")) fs.mkdirSync("./commands", { recursive: true });

const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
try {
const fullPath = require.resolve(`./commands/${file}`);
delete require.cache[fullPath];
const cmd = require(`./commands/${file}`);
if (cmd.name) global.commands.set(cmd.name, cmd);
} catch {}
}
};

async function startSavage() {
const sessionPath = "./session";

const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({
version,
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
},
printQRInTerminal: true,
logger: pino({ level: "silent" }),
browser: ["SΛVΛGΞ-TECH", "Safari", "1.0.0"]
});

global.sock = sock;

sock.ev.on("creds.update", saveCreds);

sock.ev.on("messages.upsert", async (m) => {
const msg = m.messages?.[0];
if (!msg || !msg.message) return;

const from = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;

// FIXED ADMIN CHECK
let isAdmin = false;
if (from.endsWith("@g.us")) {
isAdmin = await checkAdmin(sock, from, sender);
}

// run antistatusmention
await handleStatus(sock, msg, from, sender, isAdmin);
});

sock.ev.on("connection.update", async () => {});
sock.ev.on("messages.update", async () => {});
sock.ev.on("group-participants.update", async () => {});
}

loadCommands();
startSavage();
