const ny = [
  "Happy New Year! May this year be your best one yet.",
  "Cheers to a fresh start and new beginnings.",
  "Wishing you 365 days of happiness and success.",
  "May the new year bring you peace, joy, and prosperity.",
  "New year, new goals, same amazing you.",
  "Happy New Year! Let's make this year unforgettable.",
  "Out with the old, in with the new. Happy New Year!",
  "May your resolutions be kept and your champagne be bubbly.",
  "Wishing you a year full of adventures and achievements.",
  "Happy New Year! Don't look back – you're not going that way.",
  "May the year ahead be filled with love and laughter.",
  "Here's to a year of growth and gratitude.",
  "New year, same fabulous you. Let's rock this year!",
  "Wishing you health, wealth, and happiness this year.",
  "Happy New Year! May all your dreams take flight.",
  "Let's make this year count. Happy New Year!",
  "May the new year bring you closer to your goals.",
  "Wishing you 12 months of success, 52 weeks of laughter, and 365 days of joy.",
  "Happy New Year! Time to turn the page and write a new story.",
  "May your year be as bright as your smile.",
  "New year, new opportunities, new blessings. Embrace them all.",
  "Happy New Year! Let's leave behind the bad and welcome the good.",
  "Wishing you a year of positive vibes only.",
  "May your days be filled with sunshine and your nights with stars.",
  "Happy New Year! Remember, you are capable of amazing things.",
  "Another year, another chance to be awesome.",
  "May the new year bring you everything you've been hoping for.",
  "Wishing you a year of making memories and achieving dreams.",
  "Happy New Year! Let's party like it's 2025!",
  "Here's to a year of being unapologetically you."
];
module.exports = {
  name: 'newyear',
  category: 'fun',
  description: 'New Year wishes',
  async execute(sock, msg, args) {
    const random = ny[Math.floor(Math.random() * ny.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🎆 *Happy New Year, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
