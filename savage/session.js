const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function generateSession() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        console.clear();
        console.log("⚡ SAVAGE-TECH SESSION GENERATOR ⚡");
        const phoneNumber = await question("Enter your WhatsApp number (e.g., 2547XXXXXXXX): ");
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\n🚀 YOUR PAIRING CODE: ${code}\n`);
    }

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            await delay(5000); 
            const creds = fs.readFileSync("./temp_session/creds.json");
            const sessionID = Buffer.from(creds).toString("base64");
            
            console.log("\n✅ SESSION GENERATED!");
            console.log("------------------------------------------");
            console.log(`SAVAGE-TECH~${sessionID}`);
            console.log("------------------------------------------");
            
            fs.rmSync("./temp_session", { recursive: true, force: true });
            process.exit(0);
        }
    });
}
generateSession();
