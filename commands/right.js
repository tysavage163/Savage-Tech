module.exports = {
    name: "right",
    category: "fun",
    execute(sock, msg) {
        require('./snakeMove').execute(sock, msg, ["right"]);
    }
};
