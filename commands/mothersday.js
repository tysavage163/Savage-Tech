const mothers = [
  "Happy Mother's Day to the most amazing mom.",
  "Thank you for your unconditional love, Mom.",
  "Mom, you're my first friend and my forever confidant.",
  "Wishing you a day as beautiful as your heart.",
  "I'm grateful for every hug, every meal, every prayer. Happy Mother's Day!",
  "Mom, your strength inspires me every day.",
  "Thank you for being my rock through everything.",
  "You deserve all the love and appreciation today and always.",
  "Happy Mother's Day to the queen of our family.",
  "Mom, you taught me how to love, how to forgive, and how to be strong.",
  "I'm so lucky to call you my mother. Love you!",
  "Thank you for all the sacrifices you made for me.",
  "Mom, you're not just my mother, you're my best friend.",
  "Happy Mother's Day to the woman who makes everything better.",
  "Your love is my safe harbor. Thank you, Mom.",
  "I hope your day is filled with rest and joy. You've earned it.",
  "Mom, you're the heart of our home.",
  "Thank you for the late nights, the early mornings, and the endless care.",
  "Happy Mother's Day to the most selfless person I know.",
  "You've shaped me into who I am. I'm forever grateful.",
  "Mom, your smile is my sunshine. Enjoy your day!",
  "I love you more than all the stars in the sky. Happy Mother's Day!",
  "Thank you for believing in me when no one else did.",
  "Mom, you're a superhero without a cape. Happy Mother's Day!",
  "Wishing you a day filled with flowers, chocolates, and happiness.",
  "You taught me how to dream and how to work hard. Thank you, Mom.",
  "Happy Mother's Day to my first teacher and my forever guide.",
  "Mom, your love is the greatest gift I've ever received.",
  "I hope you feel as special as you truly are. Love you, Mom!",
  "Thank you for being my light in dark times. Happy Mother's Day!"
];
module.exports = {
  name: 'mothersday',
  category: 'fun',
  description: 'Mother’s Day wishes',
  async execute(sock, msg, args) {
    const random = mothers[Math.floor(Math.random() * mothers.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `👩 *Happy Mother's Day, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
