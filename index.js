const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const messagesCache = new Map();
global.commands = new Map();
global.prefix = ".";

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            if (command.name) {
                global.commands.set(command.name, command);
                console.log(`✅ Loaded: ${command.name}`);
            }
        } catch (err) { }
    }
}

async function startSavage() {
    loadCommands();
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // 🔒 THE SAFETY LOCK: Only ask for code when connection is ready
    if (!sock.authState.creds.registered) {
        console.log("\n⏳ Waiting for server connection...");
        
        // Wait for the socket to emit a 'connecting' or 'open' state
        sock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'connecting' || connection === 'open') {
                // Give it 5 extra seconds to be absolutely sure
                await new Promise(r => setTimeout(r, 5000));
                
                if (!sock.authState.creds.registered) {
                    const phoneNumber = await question("\n📞 Enter number (2547XXXXXXXX): ");
                    try {
                        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                        console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
                    } catch (err) {
                        console.log("❌ Request failed. Please restart the bot.");
                    }
                }
            }
        });
    }

    sock.ev.on('creds.update', saveCreds);

    // ANTI-DELETE & COMMANDS
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        if (!messagesCache.has(from)) messagesCache.set(from, new Map());
        messagesCache.get(from).set(msg.key.id, msg);

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const command = global.commands.get(args.shift().toLowerCase());
            if (command) command.execute(sock, msg, args, from);
        }
    });

    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cached = messagesCache.get(key.remoteJid)?.get(key.id);
            if (cached) {
                const content = cached.message.conversation || cached.message.extendedTextMessage?.text || "Media Message";
                await sock.sendMessage(key.remoteJid, { text: `🗑️ *ANTIDELETE*\n\n💬 ${content}` });
            }
        } catch (e) { }
    });

    sock.ev.on("connection.update", (up) => {
        if (up.connection === "open") console.log("✅ SAVAGE-TECH IS ONLINE");
        if (up.connection === "close") startSavage();
    });
}

startSavage();
