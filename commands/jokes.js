const jokes = [
  "Why don't scientists trust atoms? Because they make up everything.",
  "What do you call a fake noodle? An impasta.",
  "Why did the scarecrow win an award? He was outstanding in his field.",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call a fish with no eyes? A fsh.",
  "How does a penguin build its house? Igloos it together.",
  "Why don't eggs tell jokes? They'd crack each other up.",
  "What do you call a bear with no teeth? A gummy bear.",
  "Why did the bicycle fall over? It was two-tired.",
  "What do you call a sleeping bull? A bulldozer.",
  "Why did the math book look so sad? Because it had too many problems.",
  "What do you call a can opener that doesn't work? A can't opener.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "What do you call a factory that sells generally okay products? A satis-factory.",
  "Why did the coffee file a police report? It got mugged.",
  "What do you call a pig that does karate? A pork chop.",
  "Why did the golfer bring two pairs of pants? In case he got a hole in one.",
  "What do you call a cow with no legs? Ground beef.",
  "Why don't melons get married? Because they cantaloupe.",
  "What do you call a fake stone? A sham-rock.",
  "Why did the cookie go to the doctor? It felt crumbly.",
  "What do you call a belt made of watches? A waist of time.",
  "Why did the banana go to the doctor? It wasn't peeling well.",
  "What do you call a snowman with a six-pack? An abdominal snowman.",
  "Why did the man throw a clock out the window? He wanted to see time fly.",
  "What do you call a dog that does magic? A Labracadabrador.",
  "Why did the picture go to jail? It was framed.",
  "What do you call a dinosaur with an extensive vocabulary? A thesaurus.",
  "Why did the stadium get hot after the game? Because all the fans left.",
  "What do you call a fish wearing a bowtie? So-fish-ticated."
];
module.exports = {
  name: 'jokes',
  category: 'fun',
  description: 'Random joke',
  async execute(sock, msg, args) {
    const random = jokes[Math.floor(Math.random() * jokes.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `😂 *Joke for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
