const SIZE = 10;

function createGame() {
    return {
        snake: [{ x: 5, y: 5 }],
        dir: "RIGHT",
        food: { x: 2, y: 2 },
        score: 0,
        over: false
    };
}

function render(game) {
    let out = [];

    for (let y = 0; y < SIZE; y++) {
        let row = "";

        for (let x = 0; x < SIZE; x++) {

            const snake = game.snake.some(s => s.x === x && s.y === y);
            const food = game.food.x === x && game.food.y === y;

            if (snake) row += "🟩";
            else if (food) row += "🍎";
            else row += "⬛";
        }

        out.push(row);
    }

    return out.join("\n");
}

function move(game) {

    const head = { ...game.snake[0] };

    if (game.dir === "UP") head.y--;
    if (game.dir === "DOWN") head.y++;
    if (game.dir === "LEFT") head.x--;
    if (game.dir === "RIGHT") head.x++;

    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= SIZE ||
        head.y >= SIZE
    ) {
        game.over = true;
        return;
    }

    if (game.snake.some(s => s.x === head.x && s.y === head.y)) {
        game.over = true;
        return;
    }

    game.snake.unshift(head);

    if (head.x === game.food.x && head.y === game.food.y) {
        game.score++;

        game.food = {
            x: Math.floor(Math.random() * SIZE),
            y: Math.floor(Math.random() * SIZE)
        };
    } else {
        game.snake.pop();
    }
}

module.exports = { createGame, render, move };
