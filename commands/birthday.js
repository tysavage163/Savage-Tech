const birthday = [
  "Happy birthday! May your day be as wonderful as you are.",
  "Another year older, another year bolder. Happy birthday!",
  "Cheers to you on your special day!",
  "Wishing you a day filled with cake, laughter, and joy.",
  "Happy birthday! You're not old, you're vintage.",
  "May your birthday be the start of a year full of happiness.",
  "You're not getting older, you're leveling up. Happy birthday!",
  "Happy birthday to someone who makes the world brighter.",
  "Eat cake, be merry, and have a fantastic birthday!",
  "Today is your day – enjoy every moment!",
  "Happy birthday! I hope your cake is as sweet as you.",
  "You deserve all the happiness today and always.",
  "Another trip around the sun – make it count!",
  "Happy birthday! May your wishes come true.",
  "You're like fine wine – you get better with age.",
  "Happy birthday to my favorite person in the world!",
  "Don't count the candles, just enjoy the glow.",
  "Wishing you a year full of amazing adventures.",
  "Happy birthday! Let's eat cake until we can't move.",
  "You're a gift to everyone who knows you. Enjoy your day.",
  "Happy birthday! May your smile never fade.",
  "The world is better because you're in it. Happy birthday!",
  "Another year, another reason to celebrate you.",
  "Happy birthday! Go wild, you deserve it.",
  "May your day be filled with love and laughter.",
  "You're not old, you're a classic. Happy birthday!",
  "Happy birthday! Here's to health, wealth, and happiness.",
  "Wishing you a birthday as special as you are.",
  "Enjoy your day – you've earned it!",
  "Happy birthday! May this year bring you everything you've wished for."
];
module.exports = {
  name: 'birthday',
  category: 'fun',
  description: 'Birthday wish',
  async execute(sock, msg, args) {
    const random = birthday[Math.floor(Math.random() * birthday.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🎂 *Happy Birthday, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
