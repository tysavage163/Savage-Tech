// commands/country.js

const axios = require('axios');

module.exports = {
    category: 'fun and games',
    name: 'country',
    description: 'Get information about any country',

    async execute(sock, msg, args) {

        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text:
`❌ Please provide a country name.

Example:
.country Italy`
            });
        }

        const query = args.join(' ');

        await sock.sendMessage(from, {
            text: '🌍 Fetching country information...'
        });

        try {

            const url =
                `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=true`;

            const response =
                await axios.get(url);

            const data = response.data[0];

            if (!data) {
                return sock.sendMessage(from, {
                    text: '❌ Country not found.'
                });
            }

            const name =
                data.name?.common || 'Unknown';

            const official =
                data.name?.official || 'Unknown';

            const capital =
                data.capital?.[0] || 'Unknown';

            const region =
                `${data.region || 'Unknown'} › ${data.subregion || 'Unknown'}`;

            const population =
                data.population
                    ? data.population.toLocaleString()
                    : 'Unknown';

            const currencyKey =
                Object.keys(data.currencies || {})[0];

            const currency =
                currencyKey
                    ? `${data.currencies[currencyKey].name} (${data.currencies[currencyKey].symbol || currencyKey})`
                    : 'Unknown';

            const languages =
                data.languages
                    ? Object.values(data.languages).join(', ')
                    : 'Unknown';

            const callingCode =
                data.idd?.root && data.idd?.suffixes?.[0]
                    ? `${data.idd.root}${data.idd.suffixes[0]}`
                    : 'Unknown';

            const timezone =
                data.timezones?.[0] || 'Unknown';

            const drivingSide =
                data.car?.side || 'Unknown';

            const tld =
                data.tld?.join(', ') || 'Unknown';

            const flag =
                data.flag || '🌍';

            const text =
`${flag} *${name}* (${official})

🏙️ *Capital:* ${capital}
🌐 *Region:* ${region}
👥 *Population:* ${population}
💰 *Currency:* ${currency}
🗣️ *Languages:* ${languages}
📞 *Calling Code:* ${callingCode}
🕐 *Timezone:* ${timezone}
🚗 *Driving Side:* ${drivingSide}
🌐 *TLD:* ${tld}

⚡ Powered by *Savage Tech*`;

            await sock.sendMessage(from, {
                text
            });

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text:
`❌ Failed to fetch country information.

Make sure the country name is valid.

⚡ Powered by *Savage Tech*`
            });
        }
    }
};
