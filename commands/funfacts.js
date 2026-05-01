const facts = [
  "Octopuses have three hearts.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus.",
  "The Eiffel Tower can grow taller in summer due to heat expansion.",
  "Honey never spoils – archaeologists have found 3,000-year-old honey still edible.",
  "A group of flamingos is called a 'flamboyance'.",
  "You can't hum while holding your nose closed.",
  "The unicorn is the national animal of Scotland.",
  "A jiffy is an actual unit of time (1/100th of a second).",
  "Wombat poop is cube-shaped.",
  "The shortest war in history was between Britain and Zanzibar in 1896 – lasted 38 minutes.",
  "A shrimp's heart is in its head.",
  "Sloths can hold their breath longer than dolphins.",
  "Cows have best friends and get stressed when separated.",
  "The smell of freshly cut grass is a plant distress signal.",
  "Octopuses have blue blood.",
  "There's a type of jellyfish that is biologically immortal.",
  "The human nose can remember 50,000 different scents.",
  "A bolt of lightning is 5 times hotter than the sun.",
  "Butterflies taste with their feet.",
  "The average person will spend six months of their life waiting for red lights to turn green.",
  "A hippo's sweat is pink and acts as a natural sunscreen.",
  "The first oranges weren't orange – they were green.",
  "An ostrich's eye is bigger than its brain.",
  "Polar bear skin is black, not white.",
  "The Great Wall of China is not visible from space with the naked eye.",
  "A cow produces around 200,000 glasses of milk in its lifetime.",
  "Koalas have fingerprints nearly identical to humans.",
  "A group of owls is called a parliament.",
  "An adult human is made up of about 7,000,000,000,000,000,000,000,000,000 atoms."
];
module.exports = {
  name: 'funfacts',
  category: 'fun',
  description: 'Random fun fact',
  async execute(sock, msg, args) {
    const random = facts[Math.floor(Math.random() * facts.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🧠 *Fun Fact for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
