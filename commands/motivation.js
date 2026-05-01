const motivation = [
  "You are stronger than you think.",
  "One small positive thought can change your whole day.",
  "Don't stop until you're proud.",
  "Make today so awesome that yesterday gets jealous.",
  "You've got this!",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Believe in yourself and you will be unstoppable.",
  "Your limitation—it’s only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Stay positive, work hard, make it happen.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "Keep going. Everything you need will come to you at the perfect time.",
  "You are capable of amazing things.",
  "Small progress is still progress.",
  "It's going to be hard, but hard is not impossible.",
  "You didn't come this far to only come this far.",
  "Wake up with determination, go to bed with satisfaction.",
  "Don't downgrade your dream just to fit your reality. Upgrade your conviction to match your destiny.",
  "Success doesn't just find you. You have to go out and get it.",
  "The secret to getting ahead is getting started.",
  "You can't have a better tomorrow if you're still thinking about yesterday.",
  "Do something today that your future self will thank you for.",
  "Champions keep playing until they get it right.",
  "If it doesn't challenge you, it won't change you.",
  "Your passion is waiting for your courage to catch up.",
  "Start where you are. Use what you have. Do what you can."
];
module.exports = {
  name: 'motivation',
  category: 'fun',
  description: 'Motivational message',
  async execute(sock, msg, args) {
    const random = motivation[Math.floor(Math.random() * motivation.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💪 *Motivation for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
