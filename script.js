let level = 1;

let size = 5;

let start = {
    x: 0,
    y: 0
};

let end = {
    x: 4,
    y: 4
};

let player = {
    x: 0,
    y: 0
};

let path = [];

let timer = null;

let startTime = 0;

let gameRunning = false;


const board = document.getElementById("board");

const levelText = document.getElementById("level");

const timeText = document.getElementById("time");

const bestText = document.getElementById("best");

const message = document.getElementById("message");

const winScreen = document.getElementById("winScreen");

const winTime = document.getElementById("winTime");

const newBest = document.getElementById("newBest");


/* =========================
   BEST TIME
========================= */

function getBest() {

    const saved = localStorage.getItem(
        "bindas-best-level-" + level
    );

    if (saved === null) {
        return null;
    }

    return Number(saved);
}


function updateBest() {

    const best = getBest();

    if (best === null) {

        bestText.textContent = "--";

    } else {

        bestText.textContent =
            best.toFixed(2) + "s";
    }
}


/* =========================
   SHUFFLE
========================= */

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


/* =========================
   SECRET PATH
========================= */

function createSecretPath() {

    path = [];

    const visited = [];

    for (let y = 0; y < size; y++) {

        visited[y] = [];

        for (let x = 0; x < size; x++) {

            visited[y][x] = false;
        }
    }


    function findPath(x, y) {

        visited[y][x] = true;

        path.push({
            x: x,
            y: y
        });


        if (
            x === end.x &&
            y === end.y
        ) {

            return true;
        }


        let directions = shuffle([

            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }

        ]);


        for (const direction of directions) {

            const nx = x + direction.x;

            const ny = y + direction.y;


            if (
                nx >= 0 &&
                nx < size &&
                ny >= 0 &&
                ny < size &&
                !visited[ny][nx]
            ) {

                if (findPath(nx, ny)) {

                    return true;
                }
            }
        }


        path.pop();

        return false;
    }


    findPath(start.x, start.y);
}


/* =========================
   CREATE BOARD
========================= */

function createBoard() {

    board.innerHTML = "";

    board.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;


    for (let y = 0; y < size; y++) {

        for (let x = 0; x < size; x++) {

            const cell =
                document.createElement("div");

            cell.className = "cell";

            cell.dataset.x = x;

            cell.dataset.y = y;


            /* ONLY START IS VISIBLE */

            if (
                x === start.x &&
                y === start.y
            ) {

                cell.classList.add("start");

                cell.textContent = "🟢";
            }


            /* ONLY END IS VISIBLE */

            if (
                x === end.x &&
                y === end.y
            ) {

                cell.classList.add("end");

                cell.textContent = "🏁";
            }


            board.appendChild(cell);
        }
    }
}


/* =========================
   CHECK NEXT MOVE
========================= */

function isCorrectMove(x, y) {

    const currentIndex =
        path.findIndex(point =>

            point.x === player.x &&
            point.y === player.y

        );


    if (currentIndex === -1) {

        return false;
    }


    const next =
        path[currentIndex + 1];


    if (!next) {

        return false;
    }


    return (
        next.x === x &&
        next.y === y
    );
}


/* =========================
   MOVE PLAYER
========================= */

function movePlayer(dx, dy) {

    if (!gameRunning) {
        return;
    }


    const newX = player.x + dx;

    const newY = player.y + dy;


    /* OUTSIDE BOARD */

    if (
        newX < 0 ||
        newX >= size ||
        newY < 0 ||
        newY >= size
    ) {

        return;
    }


    /* CORRECT MOVE */

    if (
        isCorrectMove(
            newX,
            newY
        )
    ) {

        player.x = newX;

        player.y = newY;


        message.textContent =
            "✅ Correct! Remember it.";


        /*
            NOTHING IS DRAWN.

            Player is invisible.
            Path is invisible.
        */


        if (
            player.x === end.x &&
            player.y === end.y
        ) {

            finishLevel();
        }

    }

    /* WRONG MOVE */

    else {

        player.x = start.x;

        player.y = start.y;


        message.textContent =
            "❌ Wrong! Back to START.";

        /*
            No animation.
            No path.
            No player marker.
        */
    }
}


/* =========================
   TIMER
========================= */

function startTimer() {

    clearInterval(timer);

    startTime = performance.now();

    gameRunning = true;


    timer = setInterval(() => {

        const seconds =
            (
                performance.now() -
                startTime
            ) / 1000;


        timeText.textContent =
            seconds.toFixed(1) + "s";

    }, 100);
}


function stopTimer() {

    clearInterval(timer);

    gameRunning = false;


    return (
        performance.now() -
        startTime
    ) / 1000;
}


/* =========================
   FINISH LEVEL
========================= */

function finishLevel() {

    const finalTime =
        stopTimer();


    const oldBest =
        getBest();


    if (
        oldBest === null ||
        finalTime < oldBest
    ) {

        localStorage.setItem(
            "bindas-best-level-" + level,
            finalTime
        );


        newBest.textContent =
            "🔥 NEW BEST TIME!";

    } else {

        newBest.textContent =
            "Best: " +
            oldBest.toFixed(2) +
            " seconds";
    }


    updateBest();


    winTime.textContent =
        "Your time: " +
        finalTime.toFixed(2) +
        " seconds";


    winScreen.style.display =
        "flex";
}


/* =========================
   NEXT LEVEL
========================= */

function nextLevel() {

    winScreen.style.display =
        "none";


    if (level < 30) {

        level++;

        startLevel();

    } else {

        message.textContent =
            "🏆 ALL 30 LEVELS COMPLETE!";

        gameRunning = false;
    }
}


/* =========================
   RESTART
========================= */

function restartLevel() {

    winScreen.style.display =
        "none";


    player.x = start.x;

    player.y = start.y;


    createSecretPath();

    createBoard();


    message.textContent =
        "Find the hidden path!";


    timeText.textContent =
        "0.0s";


    startTimer();
}


/* =========================
   NEW GAME
========================= */

function newGame() {

    level = 1;

    startLevel();
}


/* =========================
   LEVEL SETTINGS
========================= */

function setupLevel() {

    /*
        LEVEL 1-10  = 5×5
        LEVEL 11-30 = 6×6
    */

    if (level <= 10) {

        size = 5;

    } else {

        size = 6;
    }


    start = {
        x: 0,
        y: 0
    };


    /*
        Different END positions.
    */

    const ends = [

        {
            x: size - 1,
            y: size - 1
        },

        {
            x: size - 1,
            y: 0
        },

        {
            x: 0,
            y: size - 1
        },

        {
            x: Math.floor(size / 2),
            y: size - 1
        },

        {
            x: size - 1,
            y: Math.floor(size / 2)
        }

    ];


    end =
        ends[
            (level - 1) %
            ends.length
        ];
}


/* =========================
   START LEVEL
========================= */

function startLevel() {

    setupLevel();


    player.x = start.x;

    player.y = start.y;


    createSecretPath();

    createBoard();

    updateBest();


    levelText.textContent =
        level;


    timeText.textContent =
        "0.0s";


    if (level <= 10) {

        message.textContent =
            "5×5 — Find the hidden path!";

    } else {

        message.textContent =
            "6×6 — Difficulty increased!";
    }


    startTimer();
}


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "ArrowUp") {

            event.preventDefault();

            movePlayer(0, -1);

        }

        else if (event.key === "ArrowDown") {

            event.preventDefault();

            movePlayer(0, 1);

        }

        else if (event.key === "ArrowLeft") {

            event.preventDefault();

            movePlayer(-1, 0);

        }

        else if (event.key === "ArrowRight") {

            event.preventDefault();

            movePlayer(1, 0);

        }

    }
);


/* =========================
   START GAME
========================= */

startLevel();