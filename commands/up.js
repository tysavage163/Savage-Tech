module.exports = {
    name: "up",
    category: "fun",
    execute(sock, msg) {
        require('./snakeMove').execute(sock, msg, ["up"]);
    }
};
