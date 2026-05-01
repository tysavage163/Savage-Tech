const adviceList = [
  "Don't cry because it's over, smile because it happened.",
  "The only limit is your mind.",
  "Start where you are. Use what you have. Do what you can.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "You are enough just as you are.",
  "Take time to do what makes your soul happy.",
  "Don't wait for the perfect moment. Take the moment and make it perfect.",
  "Let go of what you can't change.",
  "Listen to your gut, it usually knows the way.",
  "Celebrate small wins.",
  "Be kind to yourself and others.",
  "You can't pour from an empty cup. Take care of yourself first.",
  "The best revenge is massive success.",
  "Fear is only temporary. Regret lasts forever.",
  "Don't compare your chapter 1 to someone else's chapter 20.",
  "Breathe. It's just a bad day, not a bad life.",
  "What people think of you is none of your business.",
  "Stay patient and trust your journey.",
  "Your vibe attracts your tribe.",
  "Hustle in silence. Let your success make the noise.",
  "If it doesn't open, it's not your door.",
  "Sometimes you have to lose to win.",
  "Focus on the step in front of you, not the whole staircase.",
  "Don't let yesterday take up too much of today.",
  "You didn't come this far to only come this far.",
  "The comeback is always stronger than the setback.",
  "Speak your truth even if your voice shakes.",
  "Do it scared. Do it tired. Just do it.",
  "It's okay to outgrow people and places.",
  "Your only limit is the one you set for yourself."
];
module.exports = {
  name: 'advice',
  category: 'fun',
  description: 'Random life advice',
  async execute(sock, msg, args) {
    const random = adviceList[Math.floor(Math.random() * adviceList.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💡 *Advice for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
