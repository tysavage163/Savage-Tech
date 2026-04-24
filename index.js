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
const os = require("os"); // Added for RAM calculations

// ===== 1. SETTINGS & HIERARCHY =====
global.prefix = "."; 
global.architect = "254798841125"; 
global.commands = new Map();
global.antideleteMode = "on"; 
global.autoViewStatus = "on"; 
const messageStore = new Map(); 

// ===== 2. COMMAND LOADER (UPDATED TO SYNC PROPERLY) =====
const loadCommands = () => {
    global.commands.clear();
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const fullPath = require.resolve(`./commands/${file}`);
            delete require.cache[fullPath]; // CRITICAL: This allows new commands to sync
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
};

// ===== 3. START SYSTEM =====
async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("\n📸 SESSION NOT FOUND. SCAN TO CONNECT:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n🚀 SAVAGE-TECH CONNECTED & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 4. MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        if (msg.key.remoteJid === "status@broadcast") {
            if (global.autoViewStatus === "on") {
                try {
                    await sock.readMessages([msg.key]);
                    console.log(`👁️ Status viewed from: ${msg.pushName || "User"}`);
                } catch (e) {}
            }
            return; 
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));
        setTimeout(() => messageStore.delete(msg.key.id), 3600000);

        const isMe = msg.key.fromMe; 
        const isArchitect = sender.includes(global.architect); 
        const hasAccess = isArchitect || isMe; 

        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || "";

        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const cmd = global.commands.get(commandName);
        if (cmd) {
            try {
                await cmd.execute(sock, msg, args, { isArchitect, isMe, hasAccess });
            } catch (e) {
                console.error(`Error in ${commandName}:`, e);
            }
        }
    });

    // ===== 5. ANTI-DELETE ENGINE =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            const isDelete = update.update.protocolMessage?.type === 0 || update.update.message === null;
            if (isDelete) {
                if (!global.antideleteMode || global.antideleteMode === "off") return;
                const key = update.key || update.update.protocolMessage?.key;
                const prevMsg = messageStore.get(key.id);
                if (prevMsg) {
                    const senderJid = prevMsg.key.participant || prevMsg.key.remoteJid;
                    const chatJid = prevMsg.key.remoteJid;
                    const content = prevMsg.message?.conversation || prevMsg.message?.extendedTextMessage?.text || "Media Content";
                    const log = `━━━ SAVAGE-RECOVERY ━━━\n\nSENDER: @${senderJid.split("@")[0]}\nORIGIN: ${chatJid.endsWith('@g.us') ? "Group" : "DM"}\n\nCONTENT: ${content}\n\n━━━━━━━━━━━━━━━━━━━━`;
                    const hostJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    await sock.sendMessage(hostJid, { text: log, mentions: [senderJid] });
                }
            }
        }
    });
}

// ===== 6. BOOT =====
loadCommands();
startSavage();
