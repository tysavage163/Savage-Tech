const goodmornings = [
  "Rise and shine! Another beautiful day awaits.",
  "Good morning! May your coffee be strong and your day be wonderful.",
  "Wake up with determination, go to bed with satisfaction.",
  "Every sunrise is an invitation to brighten someone's day.",
  "Good morning! Smile, it's the first day of the rest of your life.",
  "The best way to predict your future is to create it. Good morning!",
  "Today is a gift – that's why it's called the present.",
  "Good morning! Let the adventure begin.",
  "Wake up, kick ass, repeat. Good morning!",
  "Don't just have a good day – make it a great one!",
  "Morning is an opportunity to reset and realign.",
  "Good morning! You're capable of amazing things.",
  "The sun is up, the sky is blue – it's beautiful, and so are you.",
  "Good morning! Go chase your dreams – they're waiting for you.",
  "Today's goals: Coffee and kindness.",
  "You woke up – that's the first victory of the day.",
  "Good morning! Believe in yourself and you'll be unstoppable.",
  "Radiate positivity and watch your day transform.",
  "Good morning! May your heart be light and your coffee strong.",
  "The early bird gets the worm, but the second mouse gets the cheese.",
  "Good morning! Don't forget to be awesome today.",
  "Every day is a second chance. Good morning!",
  "Wake up, pray, hustle, repeat. Good morning!",
  "Good morning! You've got this.",
  "Today's forecast: 100% chance of success.",
  "Good morning! Make yourself proud today.",
  "The sun is shining, and so should you.",
  "Good morning! Be the reason someone smiles today.",
  "Wake up, show up, never give up. Good morning!",
  "Good morning! Your only limit is your mind."
];
module.exports = {
  name: 'goodmorning',
  category: 'fun',
  description: 'Good morning message',
  async execute(sock, msg, args) {
    const random = goodmornings[Math.floor(Math.random() * goodmornings.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🌅 *Good morning, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
