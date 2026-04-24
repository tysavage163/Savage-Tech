const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Load all commands dynamically
global.commands = new Map();
global.prefix = "."; // Default prefix

// Load command files from /commands folder
function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (command.name) {
            global.commands.set(command.name, command);
            console.log(`✅ Loaded command: ${command.name}`);
        }
    }
}

const store = makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
});

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

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

    store.bind(sock.ev);
    global.sock = sock; // Make socket accessible everywhere

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question("\n📞 Enter Phone Number: ");
        console.log("⏳ Requesting code...");
        try {
            let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\n🔥 CODE: ${code}\n`);
        } catch (err) {
            console.log("\n❌ Error:", err.message);
            return;
        }
    }

    sock.ev.on('creds.update', saveCreds);

    // ANTI-DELETE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            let cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;
            let content = cachedMsg.message?.conversation || 
                         cachedMsg.message?.extendedTextMessage?.text || 
                         "Media";
            await sock.sendMessage(key.remoteJid, { text: `🗑️ *DELETED*\n\n${content}` });
        } catch (e) {}
    });

    // MESSAGE HANDLER (routes commands)
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || 
                    "";
        
        // Check if message starts with prefix
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = global.commands.get(commandName);
            
            if (command) {
                try {
                    await command.execute(sock, msg, args, from);
                } catch (err) {
                    console.error(`Command error (${commandName}):`, err);
                    await sock.sendMessage(from, { text: "❌ Command error!" });
                }
            }
        }
    });

    sock.ev.on("connection.update", (up) => {
        if (up.connection === "open") console.log("✅ ONLINE");
        if (up.connection === "close") setTimeout(() => startSavage(), 5000);
    });
}

startSavage();
