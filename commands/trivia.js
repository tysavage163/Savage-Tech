const trivia = [
  { q: "What is the largest ocean on Earth?", a: "Pacific Ocean" },
  { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci" },
  { q: "What is the smallest country in the world?", a: "Vatican City" },
  { q: "What is the fastest land animal?", a: "Cheetah" },
  { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare" },
  { q: "What is the capital of Japan?", a: "Tokyo" },
  { q: "What is the hardest natural substance?", a: "Diamond" },
  { q: "Who was the first person to walk on the moon?", a: "Neil Armstrong" },
  { q: "What is the longest river in the world?", a: "Nile" },
  { q: "What is the tallest mountain in the world?", a: "Mount Everest" },
  { q: "Who painted the Sistine Chapel ceiling?", a: "Michelangelo" },
  { q: "What is the largest desert on Earth?", a: "Antarctic Desert" },
  { q: "What is the national flower of Japan?", a: "Cherry blossom" },
  { q: "Who discovered penicillin?", a: "Alexander Fleming" },
  { q: "What is the capital of Canada?", a: "Ottawa" },
  { q: "Which planet is known as the Red Planet?", a: "Mars" },
  { q: "What is the most spoken language in the world?", a: "Mandarin Chinese" },
  { q: "Who wrote 'The Great Gatsby'?", a: "F. Scott Fitzgerald" },
  { q: "What is the largest mammal on Earth?", a: "Blue whale" },
  { q: "What is the currency of the United Kingdom?", a: "Pound sterling" },
  { q: "Who developed the theory of relativity?", a: "Albert Einstein" },
  { q: "What is the capital of Brazil?", a: "Brasília" },
  { q: "Which element has the chemical symbol 'O'?", a: "Oxygen" },
  { q: "Who painted 'Starry Night'?", a: "Vincent van Gogh" },
  { q: "What is the largest organ in the human body?", a: "Skin" },
  { q: "What is the name of the longest wall in the world?", a: "Great Wall of China" },
  { q: "Who wrote 'To Kill a Mockingbird'?", a: "Harper Lee" },
  { q: "What is the fastest fish in the ocean?", a: "Sailfish" },
  { q: "What is the capital of Egypt?", a: "Cairo" },
  { q: "Who invented the telephone?", a: "Alexander Graham Bell" }
];
module.exports = {
  name: 'trivia',
  category: 'fun',
  description: 'Random trivia question',
  async execute(sock, msg, args) {
    const random = trivia[Math.floor(Math.random() * trivia.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🧠 *Trivia for @${senderName}*\n\n${random.q}\n\n(Answer in 10 seconds...)\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
    setTimeout(async () => {
      await sock.sendMessage(msg.key.remoteJid, { text: `✅ *Answer:* ${random.a}` });
    }, 10000);
  }
};
