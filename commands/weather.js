const axios = require('axios');
module.exports = {
    name: 'weather',
    category: 'tools',
    description: 'Get current weather for a city',
    async execute(sock, msg, args) {
        const city = args.join(' ');
        if (!city) {
            return sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: .weather London' });
        }
        const apiKey = 'a634f0c982fc8317862b1a4a58aebf65';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        try {
            const res = await axios.get(url);
            const data = res.data;
            const text = `🌤️ *Weather in ${data.name}, ${data.sys.country}*\n🌡️ Temp: ${data.main.temp}°C\n💧 Humidity: ${data.main.humidity}%\n🌬️ Wind: ${data.wind.speed} m/s\n📝 ${data.weather[0].description}`;
            await sock.sendMessage(msg.key.remoteJid, { text });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ City not found or API error.' });
        }
    }
};
