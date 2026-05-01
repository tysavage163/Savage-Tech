const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Life is what happens when you're busy making other plans. – John Lennon",
  "In the end, we only regret the chances we didn't take. – Unknown",
  "Be the change you wish to see in the world. – Gandhi",
  "It does not matter how slowly you go as long as you do not stop. – Confucius",
  "Everything you've ever wanted is on the other side of fear. – George Addair",
  "Dream big and dare to fail. – Norman Vaughan",
  "Do what you can, with what you have, where you are. – Theodore Roosevelt",
  "Hardships often prepare ordinary people for an extraordinary destiny. – C.S. Lewis",
  "Act as if what you do makes a difference. It does. – William James",
  "Success is not how high you have climbed, but how you make a positive difference. – Booker T. Washington",
  "Keep your face always toward the sunshine—and shadows will fall behind you. – Walt Whitman",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "It always seems impossible until it's done. – Nelson Mandela",
  "You miss 100% of the shots you don't take. – Wayne Gretzky",
  "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
  "Strive not to be a success, but rather to be of value. – Albert Einstein",
  "The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. – Ralph Waldo Emerson",
  "Try not to become a man of success, but rather try to become a man of value. – Albert Einstein",
  "I have not failed. I've just found 10,000 ways that won't work. – Thomas Edison",
  "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you. – Steve Jobs",
  "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
  "The best time to plant a tree was 20 years ago. The second best time is now. – Chinese Proverb",
  "Tough times never last, but tough people do. – Robert H. Schuller",
  "You define your own life. Don't let other people write your script. – Oprah Winfrey",
  "The only person you are destined to become is the person you decide to be. – Ralph Waldo Emerson",
  "What you get by achieving your goals is not as important as what you become by achieving your goals. – Zig Ziglar",
  "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
  "Perfection is not attainable, but if we chase perfection we can catch excellence. – Vince Lombardi"
];
module.exports = {
  name: 'quotes',
  category: 'fun',
  description: 'Random famous quote',
  async execute(sock, msg, args) {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `📜 *Quote for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
