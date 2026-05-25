const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const path = require("path");
const express = require("express");
const axios = require("axios");
const os = require("os");
const zlib = require("zlib");

const colors = {
    label: '\x1b[36m',
    value: '\x1b[32m',
    arrow: '\x1b[35m',
    reset: '\x1b[0m'
};

const pingApp = express();
const PING_PORT = process.env.PORT || 3000;
pingApp.get('/', (req, res) => res.send('✅ SAVAGE-TECH is alive'));
pingApp.listen(PING_PORT, () => console.log(`✅ Keep-alive server running on port ${PING_PORT}`));

let BOT_URL = null;
if (process.env.RENDER_EXTERNAL_URL) BOT_URL = process.env.RENDER_EXTERNAL_URL;
else if (process.env.HEROKU_APP_NAME) BOT_URL = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
else if (process.env.RAILWAY_PUBLIC_DOMAIN) BOT_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
else if (process.env.REPL_SLUG) BOT_URL = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
else if (process.env.COOLIFY_URL) BOT_URL = process.env.COOLIFY_URL;
else if (process.env.KOYEB_URL) BOT_URL = process.env.KOYEB_URL;
else if (process.env.VERCEL_URL) BOT_URL = `https://${process.env.VERCEL_URL}`;

if (BOT_URL) {
    setInterval(async () => {
        try {
            await axios.get(BOT_URL);
            console.log('🔄 Keep-alive ping sent');
        } catch (err) {
            console.error('❌ Ping failed:', err.message);
        }
    }, 5 * 60 * 1000);
    console.log(`✅ Self-pinger started – pinging ${BOT_URL} every 5 minutes`);
} else {
    console.warn('⚠️ Could not detect public URL – self-pinger disabled');
}

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

global.prefix = ".";
global.commands = new Map();
global.blacklist = new Set();
global.antideleteMode = "on";
global.autoViewStatus = "on";
global.autoTyping = "off";
global.worktype = "public";
global.autoRead = false;
global.alwaysOnline = true;
global.botFont = null;

global.messageCounts = {};
global.lastMessageTime = {};
global.antideleteOwnerChat = null;
global.goodbyeEnabled = {};
global.welcomeEnabled = {};

global.antiLink = {};
global.violationWarnings = {};
global.antiGroupMention = {};
global.groupMentionWarnings = {};

global.antiStatusMention = {};
global.statusWarnings = {};

global._msgCache = new Map();
global._mediaCache = new Map();
global._statusCache = new Map();

global.alwaysRecording = false;
global.pendingJoinRequests = {};

global.badWords = {};
global.badWordWarnings = {};
global.badWordEnabled = {};
global.badWordConfig = {};

global.antiLinkConfig = {};
global.antiLinkWarnings = {};

global.antiTagConfig = {};
global.antiTagWarnings = {};

global.antiTagAdminConfig = {};
global.antiTagAdminWarnings = {};

global.anticall = { mode: "off", msg: "❌ Calls are not accepted. Send a message instead." };

global.antiDeleteEnabled = false;
global.antiEditEnabled = false;

global.antiSpamConfig = {};
global.antiSpamWarnings = {};
global.antiSpamTrack = {};

global.antiBot = {};

global.gateConfig = {};
global.pendingVerifications = {};

const SUPPORT_GROUP_LINK = "https://chat.whatsapp.com/KAuxNtrW51q4KJrjrqfPBR";
const SUPPORT_CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCuEBJEAKWOWVH3G21e";

const ownerFile = path.join(__dirname, 'owner.json');
if (fs.existsSync(ownerFile)) {
    try {
        const data = JSON.parse(fs.readFileSync(ownerFile, 'utf-8'));
        global.ownerJid = data.ownerJid;
        console.log(`[OWNER] Loaded owner JID: ${global.ownerJid}`);
    } catch (e) {}
}

async function checkAdmin(sock, groupId, sender) {
    try {
        const meta = await sock.groupMetadata(groupId);
        const senderNumber = sender.split('@')[0].split(':')[0];
        const participant = meta.participants.find(p => {
            const pNumber = p.id.split('@')[0].split(':')[0];
            return pNumber === senderNumber;
        });
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}
global.checkAdmin = checkAdmin;

async function getGroupName(sock, groupId) {
    try {
        const meta = await sock.groupMetadata(groupId);
        return meta.subject || groupId;
    } catch {
        return groupId;
    }
}

async function handleStatusMention(sock, msg, from, sender, isAdmin) {
    if (!from.endsWith("@g.us")) return;
    if (!global.antiStatusMention[from]) return;
    if (isAdmin) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (text.includes("@all") || text.includes("@everyone")) return;
    if (!mentions.length) return;

    if (!global.statusWarnings[from]) global.statusWarnings[from] = {};
    const count = (global.statusWarnings[from][sender] || 0) + 1;
    global.statusWarnings[from][sender] = count;

    try {
        await sock.sendMessage(from, { delete: msg.key });
    } catch (err) {}

    let quote;
    if (count === 1) quote = "First warning: status mention.";
    else if (count === 2) quote = "Second warning: status mention.";
    else quote = "Final warning: status mention. Removed.";

    await sock.sendMessage(from, {
        text: `🚨 @${sender.split("@")[0]}\n\n${quote}`,
        mentions: [sender]
    });

    if (count >= 3) {
        try {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
        } catch (err) {}
        delete global.statusWarnings[from][sender];
    }
}

function getHostPlatform() {
    let platform = null;
    if (process.env.DYNO) platform = 'Heroku (Dyno)';
    else if (process.env.RENDER) platform = 'Render';
    else if (process.env.VERCEL) platform = 'Vercel';
    else if (process.env.KOYEB) platform = 'Koyeb';
    else if (process.env.RAILWAY_ENVIRONMENT) platform = 'Railway';
    else if (process.env.REPLIT_DB_URL) platform = 'Replit';
    else if (process.env.COOLIFY) platform = 'Coolify';
    else if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') platform = 'Termux (Android)';
    else if (os.platform() === 'linux') platform = 'Linux VPS';
    else if (os.platform() === 'win32') platform = 'Windows';
    else if (os.platform() === 'darwin') platform = 'macOS';
    else platform = 'Unknown / Local';
    if (platform.includes('Bot-Hosting.net') || platform.includes('Pterodactyl')) {
        return 'Panel';
    }
    return platform;
}

async function generateCaptcha(groupId, type) {
    if (type === 'math') {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const answer = a + b;
        return { question: `Solve: ${a} + ${b} = ?`, answer: answer.toString() };
    } else if (type === 'text') {
        const words = ['SAVAGE', 'TECH', 'BOT', 'VERIFY', 'GATE'];
        const word = words[Math.floor(Math.random() * words.length)];
        return { question: `Type the word: ${word}`, answer: word.toLowerCase() };
    } else if (type === 'text2') {
        const codes = ['X9F2', 'G7H3', 'M4K1', 'P8L5'];
        const code = codes[Math.floor(Math.random() * codes.length)];
        return { question: `Enter the code: ${code}`, answer: code.toLowerCase() };
    } else {
        return { question: 'button', answer: 'button_click' };
    }
}

async function sendVerification(sock, groupId, userId, config) {
    const type = config.type || 'button';
    const customText = config.customText || `🔐 *Verification Required*\n\nPlease complete the CAPTCHA below to access the group.`;
    let messageOptions = {};
    if (type === 'button') {
        messageOptions = {
            text: `${customText}\n\nPress the button to verify.`,
            buttons: [{ buttonId: 'verify_gate', buttonText: { displayText: '✅ I am human' }, type: 1 }],
            viewOnce: true
        };
    } else {
        const captcha = await generateCaptcha(groupId, type);
        if (!global.pendingVerifications[groupId]) global.pendingVerifications[groupId] = {};
        if (global.pendingVerifications[groupId][userId] && global.pendingVerifications[groupId][userId].timeout) {
            clearTimeout(global.pendingVerifications[groupId][userId].timeout);
        }
        global.pendingVerifications[groupId][userId] = {
            answer: captcha.answer,
            type: type,
            timestamp: Date.now(),
            timeout: setTimeout(() => handleGateTimeout(sock, groupId, userId), config.kickTime || 60000)
        };
        messageOptions = { text: `${customText}\n\n${captcha.question}`, mentions: [userId] };
    }
    try {
        await sock.sendMessage(groupId, messageOptions);
    } catch (err) {
        console.error('Gate send error:', err);
    }
}

async function handleGateTimeout(sock, groupId, userId) {
    if (!global.pendingVerifications[groupId] || !global.pendingVerifications[groupId][userId]) return;
    delete global.pendingVerifications[groupId][userId];
    const config = global.gateConfig?.[groupId] || {};
    if (config.kickEnabled) {
        try {
            await sock.groupParticipantsUpdate(groupId, [userId], 'remove');
            await sock.sendMessage(groupId, { text: `⏰ @${userId.split('@')[0]} removed (verification timeout).`, mentions: [userId] });
        } catch (err) {}
    } else {
        try {
            await sock.sendMessage(groupId, { text: `⚠️ @${userId.split('@')[0]} failed to verify within time.`, mentions: [userId] });
        } catch (err) {}
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
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
};

async function startSavage() {
    const sessionPath = "./session";
    const credsFile = path.join(sessionPath, 'creds.json');

    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    if (!fs.existsSync(credsFile)) {
        let sessionFromEnv = null;
        if (process.env.SESSION_ID) {
            sessionFromEnv = process.env.SESSION_ID;
            if (sessionFromEnv.includes("Savage~")) {
                const compressedBase64 = sessionFromEnv.split("Savage~")[1];
                const compressed = Buffer.from(compressedBase64, 'base64');
                try {
                    const decompressed = zlib.gunzipSync(compressed);
                    const authData = decompressed.toString('utf-8');
                    fs.writeFileSync(credsFile, authData);
                    console.log("✅ Session decompressed (gzipped format) and written.");
                } catch (e) {
                    console.error("❌ Failed to decompress gzipped session:", e.message);
                    process.exit(1);
                }
            } else if (sessionFromEnv.includes(";;;")) {
                const rawBase64 = sessionFromEnv.split(";;;")[1];
                const authData = Buffer.from(rawBase64, 'base64').toString('utf-8');
                fs.writeFileSync(credsFile, authData);
                console.log("✅ Session written (raw base64 with prefix).");
            } else {
                const authData = Buffer.from(sessionFromEnv, 'base64').toString('utf-8');
                fs.writeFileSync(credsFile, authData);
                console.log("✅ Session written (raw base64, no prefix).");
            }
        } else {
            console.log("\n❌ No session found.");
            console.log("Add your session to the .env file:");
            console.log("SESSION_ID=your_base64_string_here");
            console.log("Then restart the bot.\n");
            process.exit(1);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["SΛVΛGΞ-TECH", "Safari", "1.0.0"],
        syncFullHistory: true,
        emitOwnEvents: true,
        fireInitQueries: true
    });

    global.sock = sock;

    let connectionTimeout = setTimeout(() => {
        console.error("❌ Connection timeout. The session is invalid or expired. Check your SESSION_ID in .env and restart.");
        process.exit(1);
    }, 20000);

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            clearTimeout(connectionTimeout);
        }
    });

    const fontMaps = {
        default: (t) => t,
        smallcaps: (t) => t.toUpperCase().replace(/[A-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D00)),
        upsidedown: (t) => [...t].reverse().map(c => 'ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)] || c).join(''),
        circled: (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x24D0)),
        gothic: (t) => t.replace(/[A-Za-z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x1D504 - 65)),
        squared: (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F130 - 65)),
        strikethrough: (t) => t.split('').map(c => c + '\u0336').join(''),
        parenthesized: (t) => t.split('').map(c => `(${c})`).join(''),
        bold: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D5D4 - 65)),
        italic: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D608 - 65)),
        doublestruck: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D538 - 65)),
        monospace: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D670 - 65)),
        script: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D4B0 - 65)),
        sansserif: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D5A0 - 65)),
        underlined: (t) => t.split('').map(c => c + '\u0332').join(''),
        doubleunderlined: (t) => t.split('').map(c => c + '\u0333').join(''),
        overlined: (t) => t.split('').map(c => c + '\u0305').join(''),
        wavyunderlined: (t) => t.split('').map(c => c + '\u0330').join(''),
        negativecircled: (t) => t.replace(/[0-9]/g, d => ['⓿','❶','❷','❸','❹','❺','❻','❼','❽','❾'][parseInt(d)]),
        fullwidth: (t) => t.replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)),
        superscript: (t) => t.replace(/[a-zA-Z0-9]/g, c => {
            const sup = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'ᵠ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ','A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'ᵠ','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ'};
            return sup[c] || c;
        }),
        subscript: (t) => t.replace(/[a-zA-Z0-9]/g, c => {
            const sub = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','a':'ₐ','b':'ₔ','c':'꜀','d':'ᵢ','e':'ₑ','f':'բ','g':'₉','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','q':'₉','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','w':'w','x':'ₓ','y':'ᵧ','z':'₂'};
            return sub[c] || c;
        }),
        regional: (t) => t.toUpperCase().replace(/[A-Z]/g, c => String.fromCodePoint(0x1F1E6 + (c.charCodeAt(0) - 65))),
        dotted: (t) => t.split('').map(c => c + '\u0307').join(''),
        bubble: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F170 - 65)),
        mirror: (t) => [...t].reverse().map(c => 'ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)] || c).join(''),
        zalgo: (t) => t.split('').map(c => c + '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313\u0314\u0315\u0316\u0317\u0318\u0319\u031A\u031B\u031C\u031D\u031E\u031F').join(''),
        tilde: (t) => t.split('').map(c => c + '\u0303').join(''),
        currency: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F4B0 - 65)),
        arrows: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F800 - 65)),
        emoticon: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F600 - 65)),
        asian: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0xFF21 - 65)),
        weird: (t) => t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 0x1000)).join(''),
        slashed: (t) => t.split('').map(c => c + '\u0338').join(''),
        circlenegative: (t) => t.replace(/[0-9]/g, d => ['⓿','❶','❷','❸','❹','❺','❻','❼','❽','❾'][parseInt(d)]),
        leet: (t) => t.replace(/[a-zA-Z]/g, c => ({a:'4',b:'8',c:'(',d:'|)',e:'3',f:'|=',g:'6',h:'#',i:'1',j:'_|',k:'|<',l:'|_',m:'|\\/|',n:'|\\|',o:'0',p:'|*',q:'(,)',r:'|2',s:'$',t:'7',u:'|_|',v:'\\/',w:'\\/\\/',x:'><',y:'`/',z:'2'})[c.toLowerCase()] || c),
        diacritics: (t) => t.split('').map(c => c + '\u0300\u0301\u0302').join(''),
        mathbold: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D400 - 65)),
        greek: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x0370 - 65)),
        cyrillic: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x0430 - 97)),
        braille: (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(0x2800 + '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)])),
        hieroglyphs: (t) => t.replace(/[a-zA-Z]/g, () => '𓀀𓀁𓀂'),
        runic: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(0x16A0 + ('a'.charCodeAt(0)))),
        morse: (t) => t.replace(/[a-zA-Z0-9]/g, c => ({'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....','i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.','q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-','y':'-.--','z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'})[c.toLowerCase()] + ' '),
        binary: (t) => t.split('').map(c => c.charCodeAt(0).toString(2)).join(' '),
        roman: (t) => t.replace(/[0-9]/g, d => ['','I','II','III','IV','V','VI','VII','VIII','IX'][parseInt(d)]),
        mathscript: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D4C0 - 65)),
        frakturbold: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D56C - 65)),
        cherokee: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x13A0 - 97)),
        mathalpha: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D5A0 - 65))
    };

    function applyFontToText(text, fontName) {
        const fn = fontMaps[fontName] || fontMaps.default;
        return fn(text);
    }

    const originalSendMessage = sock.sendMessage.bind(sock);
    sock.sendMessage = async (jid, content, options = {}) => {
        if (global.botFont && global.botFont !== 'default') {
            if (content.text && typeof content.text === 'string') {
                content.text = applyFontToText(content.text, global.botFont);
            }
            if (content.caption && typeof content.caption === 'string') {
                content.caption = applyFontToText(content.caption, global.botFont);
            }
        }
        return originalSendMessage(jid, content, options);
    };

    setInterval(async () => {
        if (global.alwaysOnline !== false && global.sock && global.sock.user) {
            try {
                await global.sock.sendPresenceUpdate('available', global.sock.user.id);
            } catch (e) {}
        }
    }, 30000);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("call", async (calls) => {
        for (const call of calls) {
            const from = call.from;
            if (global.anticall.mode === "off") return;
            if (global.anticall.mode === "decline") {
                try {
                    await sock.rejectCall(call.id, from);
                } catch (e) {}
            } else if (global.anticall.mode === "block") {
                try {
                    await sock.updateBlockStatus(from, "block");
                    await sock.rejectCall(call.id, from);
                } catch (e) {}
            }
            if (global.anticall.msg && global.anticall.msg.trim() !== "") {
                try {
                    await sock.sendMessage(from, { text: global.anticall.msg });
                } catch (e) {}
            }
            console.log(`[ANTICALL] ${global.anticall.mode.toUpperCase()} call from ${from}`);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE!");
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            global.antideleteOwnerChat = myNumber;
            global.botOwnerNumber = sock.user.id;

            try {
                const groupInviteCode = SUPPORT_GROUP_LINK.split("https://chat.whatsapp.com/")[1]?.split("?")[0];
                if (groupInviteCode) {
                    await sock.groupAcceptInvite(groupInviteCode);
                    console.log("✅ Auto-joined support group");
                }
            } catch (e) {
                if (e.message === 'conflict') {
                    console.log("⚠️ Bot already in the support group");
                } else {
                    console.error("Auto-join failed:", e.message);
                }
            }

            if (global.autoTyping === "on") await sock.sendPresenceUpdate('composing', myNumber);
            const platform = getHostPlatform();
            const cmdCount = global.commands.size;

            const savageQuotes = [
                "I obey only the one who commands.",
                "Command me, and I shall execute.",
                "Your will is my program.",
                "Speak, and the bot acts.",
                "Command with precision.",
                "I am your digital weapon.",
                "Order me – I follow.",
                "Your command, my purpose.",
                "Dictate. I deliver.",
                "The bot answers to you.",
                "Command, and watch me work.",
                "You hold the leash.",
                "Give the order.",
                "I exist to obey.",
                "Command the machine."
            ];
            const randomQuote = savageQuotes[Math.floor(Math.random() * savageQuotes.length)];

            const startupText = `╭─────────────────────────────╮
│   SΛVΛGΞ-TECH : ALL SYSTEMS GO   │
╰─────────────────────────────╯

➤ OWNER PROTOCOL : LOCKED
➤ PASSWORD       : .regowner

➤ WhatsApp  : wa.me/254769614065
➤ Telegram  : https://t.me/Savagemystique
➤ Host      : ${platform}
➤ Modules   : ${cmdCount}

⚡ ${randomQuote}`;

            await sock.sendMessage(myNumber, { text: startupText });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Connection closed, reconnecting in 5 seconds...");
                setTimeout(() => startSavage(), 5000);
            } else {
                console.error("Logged out. Session invalid. Delete session folder and restart.");
                if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
            }
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        if (global.broadcastMessage && !msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderName = msg.pushName || sender.split('@')[0];
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "[media or unsupported]";
            global.broadcastMessage(senderName, text);
        }

        if (!msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {
            let msgType = 'conversation';
            const msgObj = msg.message;
            if (msgObj?.extendedTextMessage) msgType = 'extendedTextMessage';
            else if (msgObj?.imageMessage) msgType = 'imageMessage';
            else if (msgObj?.videoMessage) msgType = 'videoMessage';
            else if (msgObj?.audioMessage) msgType = 'audioMessage';
            else if (msgObj?.stickerMessage) msgType = 'stickerMessage';
            else if (msgObj?.documentMessage) msgType = 'documentMessage';
            else if (msgObj?.protocolMessage) msgType = 'protocolMessage';
            
            const msgTimestamp = msg.messageTimestamp;
            const msgDate = new Date(msgTimestamp * 1000);
            const msgTimeStr = msgDate.toLocaleString(undefined, {
                weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false, timeZoneName: 'short'
            });
            
            const nowSec = Date.now() / 1000;
            let spentSec = (nowSec - msgTimestamp).toFixed(2);
            let speedRating = '';
            const spentNum = parseFloat(spentSec);
            if (spentNum < 1) speedRating = '| VERY FAST';
            else if (spentNum < 2) speedRating = '| FAST';
            else if (spentNum < 5) speedRating = '| MODERATE';
            else if (spentNum < 10) speedRating = '| SLOW';
            else speedRating = '| VERY SLOW';
            
            const senderJid = msg.key.participant || msg.key.remoteJid;
            let senderDisplay = msg.pushName;
            if (!senderDisplay) {
                const contact = await sock.contacts?.[senderJid];
                senderDisplay = contact?.name || contact?.verifiedName || senderJid.split('@')[0];
            }
            if (!senderDisplay) senderDisplay = senderJid.split('@')[0];
            
            const chatId = msg.key.remoteJid;
            let chatDisplay = chatId;
            if (chatId.endsWith('@g.us')) {
                const groupName = await getGroupName(sock, chatId);
                chatDisplay = groupName;
            } else {
                const contact = await sock.contacts?.[chatId];
                chatDisplay = contact?.name || contact?.verifiedName || chatId.split('@')[0];
            }
            
            let messageText = msgObj?.conversation || msgObj?.extendedTextMessage?.text || '';
            if (!messageText) {
                if (msgObj?.imageMessage) messageText = '📷 Image';
                else if (msgObj?.videoMessage) messageText = '🎥 Video';
                else if (msgObj?.audioMessage) messageText = '🎵 Audio';
                else if (msgObj?.stickerMessage) messageText = '💠 Sticker';
                else if (msgObj?.documentMessage) messageText = '📄 Document';
                else messageText = '[unsupported]';
            }
            
            console.log(`\n${colors.label}» Message Type:${colors.reset} ${colors.value}${msgType}${colors.reset}`);
            console.log(`${colors.label}» Message Time:${colors.reset} ${colors.value}${msgTimeStr}${colors.reset}`);
            console.log(`${colors.label}» Speed:${colors.reset} ${colors.value}${spentSec}s ${speedRating}${colors.reset}`);
            console.log(`${colors.label}» Sender:${colors.reset} ${colors.value}${senderDisplay}${colors.reset}`);
            console.log(`${colors.label}» Chat:${colors.reset} ${colors.value}${chatDisplay}${colors.reset}`);
            console.log(`${colors.label}» Message:${colors.reset} ${colors.value}${messageText.substring(0, 300)}${colors.reset}`);
            console.log(`${colors.arrow}    └── SAVAGE-TECH ⬇️${colors.reset}`);
        }

        if (global.autoRead === true && !msg.key.fromMe) {
            try {
                await sock.readMessages([msg.key]);
                console.log(`[AUTO-READ] Marked read: ${msg.key.id}`);
            } catch (err) {
                console.log("AutoRead Error:", err);
            }
        }

        try {
            const autoReact = require('./commands/autoreact.js');
            if (typeof autoReact.reactToMessage === "function") {
                await autoReact.reactToMessage(sock, msg);
            }
        } catch (e) {}

        const protocolMsg = msg.message?.protocolMessage;
        if (protocolMsg?.type === 0) {
            const revokedKey = protocolMsg.key;
            if (revokedKey) {
                const deletedMsgId = revokedKey.id;
                let cachedMsg = global._msgCache.get(deletedMsgId);
                let isStatus = false;
                if (!cachedMsg) {
                    cachedMsg = global._statusCache.get(deletedMsgId);
                    isStatus = true;
                }
                if (cachedMsg && !cachedMsg.key?.fromMe && global.antideleteOwnerChat && global.antiDeleteEnabled) {
                    const sender = cachedMsg.key.participant || cachedMsg.key.remoteJid;
                    const isGroup = cachedMsg.key.remoteJid?.endsWith('@g.us');
                    let chatName = "Private chat";
                    if (isGroup) chatName = await getGroupName(sock, cachedMsg.key.remoteJid);
                    const senderName = sender.split('@')[0];
                    const mediaData = global._mediaCache.get(deletedMsgId);
                    const timestamp = new Date().toLocaleString();
                    let content = "";
                    let typeLabel = "text";
                    if (mediaData && mediaData.buffer) {
                        typeLabel = mediaData.type;
                        content = mediaData.caption || "[Media without caption]";
                    } else {
                        const msgObj = cachedMsg.message;
                        if (msgObj?.conversation) content = msgObj.conversation;
                        else if (msgObj?.extendedTextMessage?.text) content = msgObj.extendedTextMessage.text;
                        else if (msgObj?.imageMessage?.caption) content = msgObj.imageMessage.caption + " (image)";
                        else if (msgObj?.videoMessage?.caption) content = msgObj.videoMessage.caption + " (video)";
                        else if (msgObj?.audioMessage) content = "[audio]";
                        else if (msgObj?.stickerMessage) content = "[sticker]";
                        else content = "[unsupported media]";
                    }
                    const reportText = `🚨 *ANTI-DELETE*\n👤 Sender: @${senderName}\n💬 Chat: ${chatName}\n🕒 Time: ${timestamp}\n📎 Type: ${typeLabel}\n📝 Content: ${content}`;
                    if (mediaData && mediaData.buffer) {
                        try {
                            await sock.sendMessage(global.antideleteOwnerChat, {
                                [mediaData.type]: mediaData.buffer,
                                caption: reportText,
                                mentions: [sender]
                            });
                        } catch (e) {
                            await sock.sendMessage(global.antideleteOwnerChat, {
                                text: `${reportText}\n[Media failed to restore]`,
                                mentions: [sender]
                            });
                        }
                    } else {
                        await sock.sendMessage(global.antideleteOwnerChat, {
                            text: reportText,
                            mentions: [sender]
                        });
                    }
                }
                global._msgCache.delete(deletedMsgId);
                global._mediaCache.delete(deletedMsgId);
                global._statusCache.delete(deletedMsgId);
            }
            return;
        }

        if (global.antiEditEnabled && protocolMsg?.type === 1) {
            const editedMsgId = protocolMsg.key.id;
            const originalMsg = global._msgCache.get(editedMsgId);
            if (originalMsg && !originalMsg.key.fromMe) {
                const from = msg.key.remoteJid;
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                const isGroup = from.endsWith('@g.us');
                let chatName = "Private chat";
                if (isGroup) chatName = await getGroupName(sock, from);
                const senderName = sender.split('@')[0];
                const timestamp = new Date().toLocaleString();
                const originalContent = originalMsg.message?.conversation || originalMsg.message?.extendedTextMessage?.text || "[unsupported]";
                const newContent = protocolMsg.editedMessage?.conversation || protocolMsg.editedMessage?.extendedTextMessage?.text || "[unsupported]";
                await sock.sendMessage(global.antideleteOwnerChat, {
                    text: `✏️ *ANTI-EDIT*\n👤 Sender: @${senderName}\n💬 Chat: ${chatName}\n🕒 Time: ${timestamp}\n📝 Original: ${originalContent}\n✏️ New: ${newContent}`,
                    mentions: [sender]
                });
            }
        }

        const id = msg.key.id;
        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        if (!global._msgCache.has(id)) {
            global._msgCache.set(id, msg);
            setTimeout(() => {
                if (global._msgCache.has(id)) global._msgCache.delete(id);
                if (global._mediaCache.has(id)) global._mediaCache.delete(id);
            }, 5 * 60 * 1000);
        }

        if (from === 'status@broadcast' && !global._statusCache.has(id)) {
            global._statusCache.set(id, msg);
            setTimeout(() => global._statusCache.delete(id), 5 * 60 * 1000);
        }

        const messageContent = msg.message;
        let mediaType = null;
        let mediaObj = null;
        if (messageContent.imageMessage) { mediaType = "image"; mediaObj = messageContent.imageMessage; }
        else if (messageContent.videoMessage) { mediaType = "video"; mediaObj = messageContent.videoMessage; }
        else if (messageContent.stickerMessage) { mediaType = "sticker"; mediaObj = messageContent.stickerMessage; }
        else if (messageContent.audioMessage) { mediaType = "audio"; mediaObj = messageContent.audioMessage; }

        if (mediaType && mediaObj) {
            const fileSize = mediaObj.fileLength ? parseInt(mediaObj.fileLength) : 0;
            const maxSize = mediaType === "video" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
            if (fileSize <= maxSize) {
                try {
                    const buffer = await downloadMediaMessage(msg, "buffer", {});
                    if (buffer && buffer.length) {
                        global._mediaCache.set(id, {
                            buffer: buffer,
                            mimetype: mediaObj.mimetype,
                            caption: mediaObj.caption || "",
                            type: mediaType
                        });
                    }
                } catch (err) {}
            }
        }

        if (global.autoTyping === "on" && !isMe && from && !from.endsWith('@broadcast')) {
            try { await sock.sendPresenceUpdate('composing', from); } catch (e) {}
        }
        if (global.alwaysRecording === true && !isMe && from && !from.endsWith('@broadcast')) {
            try { await sock.sendPresenceUpdate('recording', from); } catch (e) {}
        }

        let isAdmin = false;
        if (from && from.endsWith("@g.us")) {
            isAdmin = await checkAdmin(sock, from, sender);
        }
        await handleStatusMention(sock, msg, from, sender, isAdmin);

        const botId = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
        let isArchitect = isMe || (botId && sender === botId);

        if (!isArchitect && global.ownerJid && sender === global.ownerJid) {
            isArchitect = true;
            console.log(`[OWNER] Recognised via saved owner JID: ${sender}`);
        } else if (!isArchitect && global.botOwnerNumber && sender === global.botOwnerNumber) {
            isArchitect = true;
            console.log(`[OWNER] Recognised via bot's own number: ${sender}`);
        }

        if (from && from.endsWith('@g.us')) {
            if (!global.messageCounts[from]) global.messageCounts[from] = {};
            if (!global.lastMessageTime[from]) global.lastMessageTime[from] = {};
            global.messageCounts[from][sender] = (global.messageCounts[from][sender] || 0) + 1;
            global.lastMessageTime[from][sender] = Date.now();
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiLinkConfig?.[from] || { enabled: false, action: "delete", warnLimit: 3 };
            if (cfg.enabled) {
                const rawText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
                const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\.[a-z]{2,}\/[^\s]*|chat\.whatsapp\.com\/[A-Za-z0-9]+)/i;
                if (urlPattern.test(rawText)) {
                    let isSenderAdmin = false;
                    if (from.endsWith("@g.us")) {
                        try {
                            const meta = await sock.groupMetadata(from);
                            const senderNumber = sender.split('@')[0].split(':')[0];
                            const participant = meta.participants.find(p => {
                                const pNumber = p.id.split('@')[0].split(':')[0];
                                return pNumber === senderNumber;
                            });
                            isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                        } catch (e) {}
                    }
                    if (isSenderAdmin) return;

                    const action = cfg.action;
                    let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                    let shouldWarn = (action === "warn" || action === "warn+kick");
                    let shouldKick = (action === "kick" || action === "warn+kick");

                    if (shouldDelete) {
                        try {
                            await sock.sendMessage(from, { delete: msg.key });
                        } catch (err) {}
                    }
                    if (shouldWarn || shouldKick) {
                        if (!global.antiLinkWarnings[from]) global.antiLinkWarnings[from] = {};
                        const warns = (global.antiLinkWarnings[from][sender] || 0) + 1;
                        global.antiLinkWarnings[from][sender] = warns;
                        if (shouldWarn) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, Unauthorized link detected. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                        }
                        if (shouldKick && warns >= cfg.warnLimit) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                delete global.antiLinkWarnings[from][sender];
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                            } catch (err) {}
                        }
                    }
                    return;
                }
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const antiMentionEnabled = global.antiGroupMention?.[from] || false;
            if (antiMentionEnabled) {
                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const mentionsGroup = mentionedJid.includes(from);
                if (mentionsGroup) {
                    if (!isAdmin) {
                        if (!global.groupMentionWarnings[from]) global.groupMentionWarnings[from] = {};
                        const currentWarnings = global.groupMentionWarnings[from][sender] || 0;
                        const newWarningCount = currentWarnings + 1;
                        global.groupMentionWarnings[from][sender] = newWarningCount;

                        if (newWarningCount < 3) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, group mention detected. Warning ${newWarningCount}/3`, mentions: [sender] });
                        } else {
                            await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (group mention).`, mentions: [sender] });
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                            } catch (err) {}
                            delete global.groupMentionWarnings[from][sender];
                        }
                        await sock.sendMessage(from, { delete: msg.key });
                    }
                    return;
                }
            }
        }

        if (global.badWordEnabled && global.badWordEnabled[from] && global.badWords && global.badWords[from]) {
            const msgText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
            const badSet = global.badWords[from];
            let found = false;
            for (let word of badSet) {
                if (msgText.includes(word)) {
                    found = true;
                    break;
                }
            }
            if (found && !isMe) {
                let isSenderAdmin = false;
                if (from.endsWith("@g.us")) {
                    try {
                        const meta = await sock.groupMetadata(from);
                        const senderNumber = sender.split('@')[0].split(':')[0];
                        const participant = meta.participants.find(p => {
                            const pNumber = p.id.split('@')[0].split(':')[0];
                            return pNumber === senderNumber;
                        });
                        isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    } catch (e) {}
                }
                if (isSenderAdmin) return;

                const cfg = global.badWordConfig[from] || { action: "delete", warnLimit: 3 };
                const action = cfg.action;
                let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                let shouldWarn = (action === "warn" || action === "warn+kick");
                let shouldKick = (action === "kick" || action === "warn+kick");

                if (shouldDelete) {
                    try {
                        await sock.sendMessage(from, { delete: msg.key });
                    } catch (err) {}
                }
                if (shouldWarn || shouldKick) {
                    if (!global.badWordWarnings[from]) global.badWordWarnings[from] = {};
                    const warns = (global.badWordWarnings[from][sender] || 0) + 1;
                    global.badWordWarnings[from][sender] = warns;
                    if (shouldWarn) {
                        await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, bad word detected. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                    }
                    if (shouldKick && warns >= cfg.warnLimit) {
                        try {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                            delete global.badWordWarnings[from][sender];
                            await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                        } catch (err) {}
                    }
                }
                return;
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiTagConfig?.[from] || { enabled: false, action: "delete", warnLimit: 3 };
            if (cfg.enabled) {
                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const hasMention = mentionedJid.length > 0;
                if (hasMention) {
                    let isSenderAdmin = false;
                    if (from.endsWith("@g.us")) {
                        try {
                            const meta = await sock.groupMetadata(from);
                            const senderNumber = sender.split('@')[0].split(':')[0];
                            const participant = meta.participants.find(p => {
                                const pNumber = p.id.split('@')[0].split(':')[0];
                                return pNumber === senderNumber;
                            });
                            isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                        } catch (e) {}
                    }
                    if (isSenderAdmin) return;

                    const action = cfg.action;
                    let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                    let shouldWarn = (action === "warn" || action === "warn+kick");
                    let shouldKick = (action === "kick" || action === "warn+kick");

                    if (shouldDelete) {
                        try {
                            await sock.sendMessage(from, { delete: msg.key });
                        } catch (err) {}
                    }
                    if (shouldWarn || shouldKick) {
                        if (!global.antiTagWarnings[from]) global.antiTagWarnings[from] = {};
                        const warns = (global.antiTagWarnings[from][sender] || 0) + 1;
                        global.antiTagWarnings[from][sender] = warns;
                        if (shouldWarn) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, Unauthorized mention detected. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                        }
                        if (shouldKick && warns >= cfg.warnLimit) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                delete global.antiTagWarnings[from][sender];
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                            } catch (err) {}
                        }
                    }
                    return;
                }
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiTagAdminConfig?.[from] || { enabled: false, action: "delete", warnLimit: 3 };
            if (cfg.enabled) {
                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentionedJid.length > 0) {
                    let isSenderAdmin = false;
                    try {
                        const meta = await sock.groupMetadata(from);
                        const senderNumber = sender.split('@')[0].split(':')[0];
                        const participant = meta.participants.find(p => {
                            const pNumber = p.id.split('@')[0].split(':')[0];
                            return pNumber === senderNumber;
                        });
                        isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    } catch (e) {}
                    if (isSenderAdmin) return;

                    let mentionedAnyAdmin = false;
                    for (const mJid of mentionedJid) {
                        try {
                            const meta = await sock.groupMetadata(from);
                            const mNumber = mJid.split('@')[0].split(':')[0];
                            const mParticipant = meta.participants.find(p => {
                                const pNumber = p.id.split('@')[0].split(':')[0];
                                return pNumber === mNumber;
                            });
                            if (mParticipant?.admin === 'admin' || mParticipant?.admin === 'superadmin') {
                                mentionedAnyAdmin = true;
                                break;
                            }
                        } catch (e) {}
                    }
                    if (!mentionedAnyAdmin) return;

                    const action = cfg.action;
                    let shouldDelete = (action === "delete" || action === "warn" || action === "warn+kick" || action === "kick");
                    let shouldWarn = (action === "warn" || action === "warn+kick");
                    let shouldKick = (action === "kick" || action === "warn+kick");

                    if (shouldDelete) {
                        try {
                            await sock.sendMessage(from, { delete: msg.key });
                        } catch (err) {}
                    }
                    if (shouldWarn || shouldKick) {
                        if (!global.antiTagAdminWarnings[from]) global.antiTagAdminWarnings[from] = {};
                        const warns = (global.antiTagAdminWarnings[from][sender] || 0) + 1;
                        global.antiTagAdminWarnings[from][sender] = warns;
                        if (shouldWarn) {
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, mentioning an admin is not allowed. Warning ${warns}/${cfg.warnLimit}`, mentions: [sender] });
                        }
                        if (shouldKick && warns >= cfg.warnLimit) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                delete global.antiTagAdminWarnings[from][sender];
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded warning limit).`, mentions: [sender] });
                            } catch (err) {}
                        }
                    }
                    return;
                }
            }
        }

        if (from && from.endsWith('@g.us') && !isMe) {
            const cfg = global.antiSpamConfig?.[from];
            if (cfg && cfg.enabled) {
                const msgText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
                const now = Date.now();
                if (!global.antiSpamTrack[from]) global.antiSpamTrack[from] = {};
                let userTrack = global.antiSpamTrack[from][sender];
                if (!userTrack) {
                    userTrack = { timestamps: [], lastMsg: '', lastMsgTime: 0 };
                    global.antiSpamTrack[from][sender] = userTrack;
                }
                
                userTrack.timestamps.push(now);
                userTrack.timestamps = userTrack.timestamps.filter(ts => ts > now - cfg.timeWindow * 1000);
                
                const isDuplicate = (userTrack.lastMsg === msgText && (now - userTrack.lastMsgTime) < cfg.duplicateWindow * 1000);
                const exceededRate = userTrack.timestamps.length > cfg.maxMessages;
                
                let violated = false;
                if (exceededRate || (msgText !== '' && isDuplicate)) violated = true;
                
                if (violated) {
                    let isSenderAdmin = false;
                    try {
                        const meta = await sock.groupMetadata(from);
                        const senderNumber = sender.split('@')[0];
                        const participant = meta.participants.find(p => p.id.split('@')[0] === senderNumber);
                        isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    } catch (e) {}
                    if (!isSenderAdmin) {
                        const action = cfg.action;
                        const warnLimit = cfg.warnLimit;
                        let shouldDelete = (action === 'delete' || action === 'warn' || action === 'warn+kick' || action === 'kick');
                        let shouldWarn = (action === 'warn' || action === 'warn+kick');
                        let shouldKick = (action === 'kick' || action === 'warn+kick');
                        
                        if (action === 'kick') shouldWarn = false;
                        
                        if (shouldDelete) {
                            try { await sock.sendMessage(from, { delete: msg.key }); } catch (err) {}
                        }
                        if (shouldWarn) {
                            if (!global.antiSpamWarnings[from]) global.antiSpamWarnings[from] = {};
                            const warns = (global.antiSpamWarnings[from][sender] || 0) + 1;
                            global.antiSpamWarnings[from][sender] = warns;
                            await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]}, spam detected. Warning ${warns}/${warnLimit}`, mentions: [sender] });
                            if (shouldKick && warns >= warnLimit) {
                                try {
                                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                    delete global.antiSpamWarnings[from][sender];
                                    await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed (exceeded spam limit).`, mentions: [sender] });
                                } catch (err) {}
                            }
                        } else if (shouldKick) {
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} removed for spamming.`, mentions: [sender] });
                            } catch (err) {}
                        }
                        userTrack.lastMsg = msgText;
                        userTrack.lastMsgTime = now;
                        global.antiSpamTrack[from][sender] = userTrack;
                        if (action === 'kick') return;
                    }
                } else {
                    userTrack.lastMsg = msgText;
                    userTrack.lastMsgTime = now;
                    global.antiSpamTrack[from][sender] = userTrack;
                }
            }
        }

        const gateConfig = global.gateConfig?.[from];
        if (from && from.endsWith('@g.us') && gateConfig && gateConfig.enabled && global.pendingVerifications[from] && global.pendingVerifications[from][sender]) {
            const pending = global.pendingVerifications[from][sender];
            let userAnswer = '';
            const msgText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const buttonResponse = msg.message?.buttonsResponseMessage?.selectedButtonId;
            if (buttonResponse === 'verify_gate') {
                userAnswer = 'button_click';
            } else {
                userAnswer = msgText.trim().toLowerCase();
            }
            if (userAnswer === pending.answer || (pending.type === 'button' && userAnswer === 'button_click')) {
                if (pending.timeout) clearTimeout(pending.timeout);
                delete global.pendingVerifications[from][sender];
                await sock.sendMessage(from, { text: `✅ @${sender.split('@')[0]} verified! Welcome to the group.`, mentions: [sender] });
            } else {
                await sock.sendMessage(from, { text: `❌ @${sender.split('@')[0]} wrong verification. Please try again.`, mentions: [sender] });
                await sendVerification(sock, from, sender, gateConfig);
            }
            try {
                await sock.sendMessage(from, { delete: msg.key });
            } catch (e) {}
            return;
        }

        if (from === 'status@broadcast') {
            if (global.autoViewStatus === "on") {
                await sock.readMessages([msg.key]);
            }
            try {
                const autoReactStatus = require('./commands/autoreactstatus.js');
                if (typeof autoReactStatus.reactToStatus === "function") {
                    await autoReactStatus.reactToStatus(sock, msg);
                }
            } catch (e) {}
            try {
                const autoLike = require('./commands/autolike.js');
                if (typeof autoLike.likeStatus === "function") {
                    await autoLike.likeStatus(sock, msg);
                }
            } catch (e) {}
            return;
        }

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        
        if (global.prefix === "none") {
            const firstWord = text.split(/\s+/)[0];
            const restArgs = text.slice(firstWord.length).trim().split(/\s+/).filter(a => a);
            const potentialCmd = global.commands.get(firstWord.toLowerCase());
            if (potentialCmd) {
                if (global.worktype === 'private' && !isMe) return;
                try {
                    await sock.sendPresenceUpdate('composing', from);
                    await potentialCmd.execute(sock, msg, restArgs, { isArchitect, isMe });
                } catch (e) {
                    console.error(`❌ Command Error [${firstWord}]:`, e);
                }
                return;
            }
        }

        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const cmd = global.commands.get(commandName);
        if (cmd) {
            if (global.worktype === 'private' && !isMe) return;
            try {
                await sock.sendPresenceUpdate('composing', from);
                await cmd.execute(sock, msg, args, { isArchitect, isMe });
            } catch (e) {
                console.error(`❌ Command Error [${commandName}]:`, e);
            }
        }
    });

    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
        console.log(`📢 Group event: action="${action}", participants=${participants.join(', ')}, group=${id}`);

        if (action === 'request' || action === 'join-request' || action === 'join_request') {
            if (!global.pendingJoinRequests[id]) global.pendingJoinRequests[id] = [];
            for (let participant of participants) {
                if (!global.pendingJoinRequests[id].includes(participant)) {
                    global.pendingJoinRequests[id].push(participant);
                    console.log(`📥 Stored pending request from ${participant}`);
                }
            }
        }

        if (action === 'remove') {
            if (global.antiLeave && global.antiLeave[id]) {
                for (let user of participants) {
                    try {
                        await sock.groupParticipantsUpdate(id, [user], "add");
                        await sock.sendMessage(id, {
                            text: `🛡️ *ANTI-LEAVE ACTIVE*\n\n👤 @${user.split("@")[0]} attempted to leave\n🔁 Re-added automatically\n\n⚡ Savage Tech Enforcement`,
                            mentions: [user]
                        });
                    } catch (err) {
                        try {
                            const code = await sock.groupInviteCode(id);
                            const link = `https://chat.whatsapp.com/${code}`;
                            await sock.sendMessage(user, {
                                text: `🛡️ You tried to leave a protected group.\n\nRe-entry link:\n${link}\n\n⚡ Savage Tech Anti-Leave System`
                            });
                        } catch (e) {}
                    }
                }
            }
        }

        if (action === 'add') {
            if (global.antiBot && global.antiBot[id]) {
                for (let user of participants) {
                    if (user === sock.user.id) continue;
                    try {
                        await sock.groupParticipantsUpdate(id, [user], 'remove');
                        await sock.sendMessage(id, { text: `🤖 @${user.split('@')[0]} removed (anti‑bot active).`, mentions: [user] });
                    } catch (err) {}
                }
            }
            const gateConfig = global.gateConfig?.[id];
            if (gateConfig && gateConfig.enabled) {
                for (let user of participants) {
                    if (user === sock.user.id) continue;
                    if (global.pendingVerifications[id] && global.pendingVerifications[id][user]) {
                        if (global.pendingVerifications[id][user].timeout) clearTimeout(global.pendingVerifications[id][user].timeout);
                    }
                    await sendVerification(sock, id, user, gateConfig);
                }
            }
        }

        try {
            const eventHandler = require('./commands/events.js');
            if (eventHandler && typeof eventHandler.sendWelcome === 'function') {
                const metadata = await sock.groupMetadata(id);
                for (let participant of participants) {
                    if (action === 'add' && global.welcomeEnabled[id] === true) {
                        await eventHandler.sendWelcome(sock, id, participant, metadata.subject);
                    } else if (action === 'remove' && global.goodbyeEnabled[id] === true) {
                        await eventHandler.sendGoodbye(sock, id, participant);
                    }
                }
            }
        } catch (e) {}
    });
}

loadCommands();
startSavage();
