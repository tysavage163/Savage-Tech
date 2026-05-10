const games = global.games || (global.games = {});

function getGame(chatId, type) {
    games[chatId] = games[chatId] || {};
    games[chatId][type] = games[chatId][type] || {};
    return games[chatId][type];
}

function clearGame(chatId, type) {
    if (games[chatId]) {
        delete games[chatId][type];
    }
}

module.exports = {
    getGame,
    clearGame,
    games
};
