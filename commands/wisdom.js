const wisdom = [
  "The only true wisdom is in knowing you know nothing. – Socrates",
  "It does not matter how slowly you go as long as you do not stop. – Confucius",
  "The journey of a thousand miles begins with one step. – Lao Tzu",
  "He who has a why can endure almost any how. – Nietzsche",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. – Aristotle",
  "Happiness is not something ready made. It comes from your own actions. – Dalai Lama",
  "The mind is everything. What you think you become. – Buddha",
  "Be kind whenever possible. It is always possible. – Dalai Lama",
  "The only impossible journey is the one you never begin. – Tony Robbins",
  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment. – Buddha",
  "It's not what you look at that matters, it's what you see. – Henry David Thoreau",
  "The trouble is, you think you have time. – Buddha",
  "You must be the change you wish to see in the world. – Gandhi",
  "Everything you've ever wanted is on the other side of fear. – George Addair",
  "The best time to plant a tree was 20 years ago. The second best time is now. – Chinese Proverb",
  "Don't count the days, make the days count. – Muhammad Ali",
  "The secret of getting ahead is getting started. – Mark Twain",
  "If you want to fly, give up everything that weighs you down. – Buddha",
  "Act as if what you do makes a difference. It does. – William James",
  "Your work is to discover your world and then with all your heart give yourself to it. – Buddha",
  "Life is really simple, but we insist on making it complicated. – Confucius",
  "The greatest glory in living lies not in never falling, but in rising every time we fall. – Nelson Mandela",
  "In the end, it's not the years in your life that count. It's the life in your years. – Abraham Lincoln",
  "The purpose of our lives is to be happy. – Dalai Lama",
  "Life is what happens when you're busy making other plans. – John Lennon",
  "If you can dream it, you can do it. – Walt Disney",
  "It always seems impossible until it's done. – Nelson Mandela",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. – Winston Churchill",
  "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
  "You miss 100% of the shots you don't take. – Wayne Gretzky"
];
module.exports = {
  name: 'wisdom',
  category: 'fun',
  description: 'Wise sayings and quotes',
  async execute(sock, msg, args) {
    const random = wisdom[Math.floor(Math.random() * wisdom.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🧠 *Wisdom for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
