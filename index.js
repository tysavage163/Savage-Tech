const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const readline = require("readline");
const fs = require('fs');
const path = require('path');

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (answer) => { rl.close(); resolve(answer); }));
};

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    // --- PAIRING LOGIC ---
    if (!sock.authState.creds.registered) {
        console.log("🚀 SAVAGE-TECH: STARTING PAIRING MODE");
        const phoneNumber = await question('Enter your number (e.g. 254798841125):\n> ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (new Boom(lastDisconnect?.error)?.output.statusCode !== DisconnectReason.loggedOut);
            if (shouldReconnect) startSavage();
        } else if (connection === "open") {
            console.log("✅ SAVAGE-TECH IS LIVE!");
        }
    });

    // --- COMMAND LOADER ---
    const commands = new Map();
    const loadCommands = () => {
        const commandsPath = path.join(__dirname, 'commands');
        if (fs.existsSync(commandsPath)) {
            const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
            for (const file of files) {
                try {
                    const command = require(path.join(commandsPath, file));
                    if (command.name) {
                        commands.set(command.name, command);
                        console.log(`✅ Loaded command: ${command.name}`);
                    }
                } catch (e) {
                    console.log(`❌ Failed to load ${file}:`, e.message);
                }
            }
        }
        console.log(`📊 Total Commands Loaded: ${commands.size}`);
    };

    loadCommands();

    // --- MESSAGE HANDLER ---
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        const prefix = ".";

        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/\s+/);
            const commandName = args.shift().toLowerCase();

            const command = commands.get(commandName);
            if (command) {
                try {
                    await command.execute(sock, msg, args);
                } catch (e) {
                    console.error(`Error in ${commandName}:`, e);
                }
            }
        }
    });
}

startSavage();
