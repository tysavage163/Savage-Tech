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

// ===== 1. SETTINGS & HIERARCHY =====
global.prefix = "."; 
global.architect = "254798841125"; // YOU: God Mode
global.commands = new Map();
global.antideleteMode = "on"; // Default to Stealth On
const messageStore = new Map(); // Memory for Antidelete

// ===== 2. COMMAND LOADER =====
const loadCommands = () => {
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
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

    // ===== 4. MESSAGE HANDLER & HIERARCHY =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Anti-Delete: Store message for recovery
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

    // ===== 5. ANTI-DELETE ENGINE (STEALTH HOST-ONLY) =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            // Check for Protocol Message (Type 0) or Nulled Message
            const isDelete = update.update.protocolMessage?.type === 0 || update.update.message === null;
            
            if (isDelete) {
                if (!global.antideleteMode || global.antideleteMode === "off") return;

                const key = update.key || update.update.protocolMessage?.key;
                const prevMsg = messageStore.get(key.id);
                
                if (prevMsg) {
                    const sender = prevMsg.key.participant || prevMsg.key.remoteJid;
                    const isGroup = key.remoteJid.endsWith('@g.us');
                    const chatName = isGroup ? "Group Chat" : "Private DM";
                    
                    const content = prevMsg.message?.conversation || 
                                    prevMsg.message?.extendedTextMessage?.text || 
                                    prevMsg.message?.imageMessage?.caption || 
                                    "Media Content Detected";

                    const timeReceived = new Date(prevMsg.messageTimestamp * 1000).toLocaleTimeString();

                    // RADIOACTIVE CUSTOM TABLE
                    const log = `
-=☢-=☢-=☢-=☢-=☢-=☢-=☢-
*🛡️ S Λ V Λ G Ξ  STEALTH RECOVERY*

*👤 SENDER:* @${sender.split("@")[0]}
*📍 CHAT:* ${chatName}
*🕒 RECEIVED:* ${timeReceived}
*📁 STATUS:* HOST-ONLY REDIRECT

*💬 DELETED MESSAGE:*
> ${content}

-=☢-=☢-=☢-=☢-=☢-=☢-=☢-`;

                    // FORCED HOST ROUTING: Always sends to the account logged into the bot
                    const hostJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                    await sock.sendMessage(hostJid, { 
                        text: log, 
                        mentions: [sender] 
                    });
                }
            }
        }
    });
}

loadCommands();
startSavage();
