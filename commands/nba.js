const axios = require('axios');
module.exports = {
  name: 'nba',
  category: 'sports',
  description: 'Get NBA live scores',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const res = await axios.get('https://www.balldontlie.io/api/v1/games?dates[]=2025-04-10');
    const games = res.data.data.slice(0, 5);
    let text = '🏀 *NBA SCORES*\n';
    games.forEach(g => {
      text += `${g.home_team.full_name} ${g.home_team_score} - ${g.visitor_team_score} ${g.visitor_team.full_name}\n`;
    });
    await sock.sendMessage(from, { text });
  }
};
