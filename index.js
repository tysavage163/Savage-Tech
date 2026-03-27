const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('savage_session');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Savage Tech', 'Safari', '3.0']
    });

    sock.ev.on('creds.update', saveCreds);

    // Dynamic Command Loader
    const commands = new Map();
    const loadCommands = () => {
        const categories = fs.readdirSync('./commands');
        categories.forEach(category => {
            const files = fs.readdirSync(`./commands/${category}`).filter(f => f.endsWith('.js'));
            files.forEach(file => {
                const cmd = require(`./commands/${category}/${file}`);
                commands.set(cmd.name, cmd);
            });
        });
        console.log(`🚀 SAVAGE TECH: ${commands.size} Commands Loaded Successfully!`);
    };

    if (fs.existsSync('./commands')) loadCommands();

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        
        // Custom Prefix: You can use . or !
        const prefix = '.';
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            try {
                await command.execute(sock, m, args);
            } catch (err) {
                console.error("Savage Tech Error:", err);
            }
        }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'open') console.log('SAVAGE TECH INDEPENDENT PROTOCOL: ACTIVE ✅');
    });
}
startSavage();
