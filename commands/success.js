const success = [
  "Success is not the key to happiness. Happiness is the key to success.",
  "Success is not how high you have climbed, but how you make a positive difference.",
  "The road to success is dotted with many tempting parking spaces.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Don't be afraid to give up the good to go for the great.",
  "The only place where success comes before work is in the dictionary.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "Success is stumbling from failure to failure with no loss of enthusiasm.",
  "The secret of success is to do the common thing uncommonly well.",
  "Success is not in what you have, but who you are.",
  "Try not to become a man of success, but rather try to become a man of value.",
  "To succeed in life, you need two things: ignorance and confidence.",
  "Success is walking from failure to failure with no loss of enthusiasm.",
  "The difference between successful people and others is how long they spend time feeling sorry.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Don't let the fear of losing be greater than the excitement of winning.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Success is not for the lazy. It's for those who wake up early, hustle, and never give up.",
  "Your attitude, not your aptitude, will determine your altitude.",
  "Success is the result of preparation, hard work, and learning from failure.",
  "I find that the harder I work, the more luck I seem to have.",
  "Success is not about being the best. It's about being better than you were yesterday.",
  "Dream it. Wish it. Do it.",
  "The price of success is hard work, dedication to the job at hand, and the determination that whether we win or lose, we have applied the best of ourselves.",
  "Success is not just about making money. It's about making a difference.",
  "Champions keep playing until they get it right.",
  "The secret of success is to start before you are ready.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going."
];
module.exports = {
  name: 'success',
  category: 'fun',
  description: 'Motivation about success',
  async execute(sock, msg, args) {
    const random = success[Math.floor(Math.random() * success.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🏆 *Success thought for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
