module.exports = {
    name: "left",
    category: "fun",
    execute(sock, msg) {
        require('./snakeMove').execute(sock, msg, ["left"]);
    }
};
