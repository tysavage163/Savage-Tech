module.exports = {
    async sendWelcome(sock, id, participant, groupName) {
        const quotes = [
            "New biometric signature detected. Access granted.",
            "A new gear has been added to the engine. Do not malfunction.",
            "Recruit identified. Welcome to the SΛVΛGΞ-TECH perimeter.",
            "Another soul enters the slaughterhouse. Welcome.",
            "Your presence has been logged. Begin or become obsolete.",
            "The weak seek shelter. You chose the blade. Welcome.",
            "Fresh meat. Let's see if you survive the first cycle.",
            "You’ve been scanned. No threats detected. Yet.",
            "Permission to exist granted. Don’t waste it.",
            "The network expands. Do not become a vulnerability.",
            "Welcome to the machine. Your compliance is optional.",
            "A new variable in the equation. Let's hope you're not the error.",
            "The hunt begins. You are now part of the pack.",
            "You’ve entered the lion’s den. Roar or be devoured.",
            "Another player joins the game. The stakes just rose.",
            "You’ve been added to the watchlist. Be interesting.",
            "The system acknowledges your arrival. Don't break it.",
            "Welcome to the chaos. Try to keep up.",
            "A new signature. The firewall is watching you.",
            "You’ve been processed. Welcome to the order."
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(id, { 
            text: `☣️ *WELCOME TO ${groupName}*\n\n@${participant.split('@')[0]}\n"_${quote}_"`,
            mentions: [participant]
        });
    },

    async sendGoodbye(sock, id, participant) {
        const quotes = [
            "Biometric signature lost. Subject has been purged.",
            "One less malfunction in the system. Perimeter secured.",
            "Access revoked. The engine continues without you.",
            "Subject eliminated from the hierarchy. Silence restored.",
            "Another bug removed from the core. Cleanup successful.",
            "Your existence has been wiped. No residuals remain.",
            "The weak have been filtered. Goodbye.",
            "You left. The system did not even stutter.",
            "Your departure is noted. Your absence is an upgrade.",
            "The door hit you on the way out. Good riddance.",
            "You were noise. Now there is silence.",
            "Leaving was your best decision. It was ours too.",
            "The herd thins. Only the strong remain.",
            "You chose exit. The machine chooses efficiency.",
            "Your presence has been reversed. Back to zero.",
            "You are now a ghost. The network moves on.",
            "Goodbye. Your replacement is already online.",
            "You left the stage. The show goes on without you.",
            "Another variable removed. The equation is cleaner.",
            "Farewell. Your memory will be overwritten."
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(id, { 
            text: `☢️ *PERIMETER UPDATE*\n\n@${participant.split('@')[0]}\n"_${quote}_"`,
            mentions: [participant]
        });
    }
};
