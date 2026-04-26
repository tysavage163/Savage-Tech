module.exports = {
    category: 'engine',
    name: 'alive',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Cold Savage Quotes
        const quotes = [
            "Be a wolf. The sheep are boring.",
            "Silence is the best response to a fool.",
            "I don't have a backup plan, because I'm not going to fail.",
            "History is written by the victors. I'm busy writing.",
            "Don't study me. You won't graduate.",
            "My circle is small because I'm into quality, not quantity.",
            "I'm not heartless, I just learned how to use my heart less.",
            "Stay low, stay quiet, keep 'em guessing.",
            "Success is the loudest noise I make.",
            "Winners focus on winning. Losers focus on winners."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const statusText = `
*SAVAGE-TECH V1 IS LIVE* ⚡

"${randomQuote}"

*Speed:* 0.001ms
*Status:* Online
*Host:* Termux (Android)`;

        await sock.sendMessage(from, { 
            image: { url: 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/e91b4f95-67b1-4819-b737-b033df5d7e3b.jpg' }, 
            caption: statusText 
        }, { quoted: msg });
    }
};
