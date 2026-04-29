/*
╔══════════════════════════════════════════════════════╗
║  .pair – Get WhatsApp Pairing Code via API           ║
║  Usage: .pair 254712345678                           ║
╚══════════════════════════════════════════════════════╝
*/
const axios = require('axios');

module.exports = {
    name: 'pair',
    category: 'tools',
    description: 'Generate a pairing code to link a new device',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const phoneNumber = args[0];

        // Input validation
        if (!phoneNumber) {
            return await sock.sendMessage(from, {
                text: '❌ *Usage:* `.pair 254712345678`\n_Include country code without "+" or spaces._'
            });
        }
        if (!/^\d{9,15}$/.test(phoneNumber)) {
            return await sock.sendMessage(from, {
                text: '❌ *Invalid number!*\nUse only digits with country code (e.g., 254712345678).'
            });
        }

        await sock.sendMessage(from, {
            text: `📡 *Requesting pairing code for* \`${phoneNumber}\`...\n_Please wait a moment._`
        });

        try {
            // Call your pairing site API
            const apiUrl = `https://spencers-quantam-core.onrender.com/code?number=${phoneNumber}`;
            const response = await axios.get(apiUrl);
            const code = response.data.code;

            if (!code) {
                throw new Error('Invalid response from pairing site');
            }

            // Send the code back to the user
            await sock.sendMessage(from, {
                text: `🔐 *Your Pairing Code:*\n\`\`\`${code}\`\`\`\n\n📱 *How to use:*\n1️⃣ Open WhatsApp on your phone\n2️⃣ Go to *Settings* → *Linked Devices* → *Link a Device*\n3️⃣ Enter this code.\n\n⏳ *Expires in 5 minutes.*`
            });
        } catch (error) {
            console.error('Pairing error:', error);
            let errorMessage = '❌ *Failed to generate pairing code.*\n';
            if (error.response && error.response.status === 404) {
                errorMessage += 'Pairing service is not reachable. Please contact the bot owner.';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage += 'Cannot connect to the pairing service. Make sure the site is online.';
            } else {
                errorMessage += 'Check the number and try again (include country code, e.g., 254...).';
            }
            await sock.sendMessage(from, { text: errorMessage });
        }
    }
};
