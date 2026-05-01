const gfDay = [
  "Happy Girlfriend's Day to my favorite person.",
  "You make every day brighter. Enjoy your day, love!",
  "Thanks for putting up with my nonsense. You're the best.",
  "Happy Girlfriend's Day to the one who makes me smile.",
  "You're beautiful, smart, and funny – and I'm lucky to have you.",
  "I hope today reminds you how much you're loved.",
  "You're my sunshine on cloudy days. Happy Girlfriend's Day!",
  "Thank you for all the laughter and the love.",
  "I adore you more every single day. Happy Girlfriend's Day!",
  "You're my favorite hello and my hardest goodbye. Love you!",
  "Happy Girlfriend's Day to my better half.",
  "You're the peanut butter to my jelly. Let's celebrate you!",
  "I'm grateful for every moment we spend together.",
  "You make my world complete. Happy Girlfriend's Day!",
  "Thanks for being patient, kind, and absolutely amazing.",
  "Happy Girlfriend's Day to the queen of my heart.",
  "You're a blessing I never expected to receive.",
  "I love you more than words can express. Enjoy your day!",
  "You're the best thing that's ever happened to me.",
  "Happy Girlfriend's Day! Let's make more beautiful memories.",
  "Thank you for always having my back.",
  "You're my rock, my joy, my everything.",
  "I'm so proud to call you my girlfriend. Happy Girlfriend's Day!",
  "You deserve the world, and I'll try my best to give it to you.",
  "Every day with you is a gift. Happy Girlfriend's Day!",
  "You're stunning inside and out. Never forget that.",
  "Thanks for making me a better person.",
  "Happy Girlfriend's Day to my favorite distraction.",
  "I fall for you over and over again. Love you!",
  "You're my home. Happy Girlfriend's Day!"
];
module.exports = {
  name: 'girlfriendsday',
  category: 'fun',
  description: 'Girlfriend’s Day wishes',
  async execute(sock, msg, args) {
    const random = gfDay[Math.floor(Math.random() * gfDay.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💖 *Happy Girlfriend's Day, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
