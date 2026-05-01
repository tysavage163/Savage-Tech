const loveMessages = [
  "You make my world a better place.",
  "Every love story is beautiful, but ours is my favorite.",
  "You're the first thing I think of when I wake up.",
  "I love you more than all the stars in the sky.",
  "You're my home.",
  "I didn't fall in love with you, I walked into it with eyes wide open.",
  "You're the best thing that ever happened to me.",
  "My heart beats only for you.",
  "You make me smile when I don't want to.",
  "Being with you is my favorite place to be.",
  "You're my today and all of my tomorrows.",
  "I love you more than words can say.",
  "You're the reason I wake up happy.",
  "Loving you is the easiest thing I've ever done.",
  "You're my sunshine on a cloudy day.",
  "I fall in love with you a little more every day.",
  "You're my happy place.",
  "You're my everything.",
  "Every day with you is a gift.",
  "You make life worth living.",
  "I'm so grateful for you.",
  "You're my best friend and my love.",
  "My world is brighter with you in it.",
  "I can't imagine my life without you.",
  "You complete me.",
  "You're my soulmate.",
  "I love you more than all the stars in the sky.",
  "You make my heart smile.",
  "I'm the luckiest person to have you.",
  "You are my forever."
];
module.exports = {
  name: 'love',
  category: 'fun',
  description: 'Sweet love message',
  async execute(sock, msg, args) {
    const random = loveMessages[Math.floor(Math.random() * loveMessages.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `❤️ *Love message for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
