module.exports = {
    name: "down",
    category: "fun",
    execute(sock, msg) {
        require('./snakeMove').execute(sock, msg, ["down"]);
    }
};
