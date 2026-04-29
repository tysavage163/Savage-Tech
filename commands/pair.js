/*
╔══════════════════════════════════════════════════════╗
║  .pair – Get WhatsApp Pairing Code (Public)          ║
║  Usage: .pair 254712345678                           ║
╚══════════════════════════════════════════════════════╝
*/

module.exports = {
    name: 'pair',
    category: 'tools',        // or 'group' / 'engine' – you decide
    description: 'Generate a pairing code to link a new device (Anyone can use)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Get phone number from arguments
        const phoneNumber = args[0];
        if (!phoneNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ *Usage:* `.pair 254712345678`\n_Include country code without "+" or spaces._' 
            });
        }

        // Basic validation: digits only, at least 9 digits
        if (!/^\d{9,15}$/.test(phoneNumber)) {
            return await sock.sendMessage(from, { 
                text: '❌ *Invalid number!*\nUse only digits with country code (e.g., 254712345678).' 
            });
        }

        await sock.sendMessage(from, { 
            text: `📡 *Requesting pairing code for* \`${phoneNumber}\`...\n_Please wait a moment._` 
        });

        try {
            // Ensure the socket is ready (sock.user exists)
            if (!sock.user) {
                await new Promise(resolve => {
                    const check = setInterval(() => {
                        if (sock.user) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 100);
                });
            }

            // Request the 8-digit pairing code from WhatsApp
            const code = await sock.requestPairingCode(phoneNumber);

            // Send the code back to the user in the same chat
            await sock.sendMessage(from, {
                text: `🔐 *Your Pairing Code:*\n\`\`\`${code}\`\`\`\n\n📱 *How to use:*\n1️⃣ Open WhatsApp on your phone\n2️⃣ Go to *Settings* → *Linked Devices* → *Link a Device*\n3️⃣ Enter this code.\n\n⏳ *Expires in 5 minutes.*`
            });
        } catch (error) {
            console.error('Pairing error:', error);
            let errorMessage = '❌ *Failed to generate pairing code.*\n';
            if (error.message && error.message.includes('not ready')) {
                errorMessage += 'Bot is still connecting. Try again in 10 seconds.';
            } else if (error.message && error.message.includes('rate-overlimit')) {
                errorMessage += 'Too many attempts. Please wait a few minutes.';
            } else {
                errorMessage += 'Check the number and try again (include country code, e.g., 254...).';
            }
            await sock.sendMessage(from, { text: errorMessage });
        }
    }
};
