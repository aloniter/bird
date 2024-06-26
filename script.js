const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// Set canvas dimensions based on the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: canvas.width / 4, // Adjusted size
    height: canvas.width / 4, // Adjusted size
    gravity: 0.4,
    lift: -6,
    velocity: 0,
    image: new Image()
};

bird.image.src = 'cookie.png';

const pipeImage = new Image();
pipeImage.src = 'cookie_tube.png';

const coinImages = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
coinImages[0].src = 'coin1.png';
coinImages[1].src = 'coin2.png';
coinImages[2].src = 'coin3.png';
coinImages[3].src = 'coin4.png';
coinImages[4].src = 'coin5.png';
coinImages[5].src = 'coin6.png';

const pipes = [];
const coins = [];
const pipeWidth = canvas.width / 8; // Adjusted for larger canvas
const pipeGap = canvas.height / 3;
const coinSize = canvas.width / 8; // Adjusted size
let frame = 0;
let score = 0;
let bestScore = 0;
let points = 0;
let gameOver = false;
let firstGame = true;

const soundtrack = document.getElementById("soundtrack");

function startSoundtrack() {
    soundtrack.currentTime = 0;
    soundtrack.play();
}

soundtrack.addEventListener('canplaythrough', () => {
    console.log('Soundtrack can play through.');
    if (firstGame) {
        startSoundtrack();
        firstGame = false;
    }
});

soundtrack.addEventListener('ended', () => {
    soundtrack.currentTime = 0;
    soundtrack.play();
});

document.addEventListener("keydown", () => {
    if (!gameOver) {
        bird.velocity = bird.lift;
    } else {
        resetGame();
    }
});

// Prevent touchstart event from triggering multiple times
let touchStartTime = 0;

// Add event listeners for touch and click events
canvas.addEventListener("touchstart", (e) => {
    const now = Date.now();
    if (now - touchStartTime > 100) { // Prevents double touch
        if (!gameOver) {
            bird.velocity = bird.lift;
        } else {
            resetGame();
        }
        touchStartTime = now;
    }
});

canvas.addEventListener("click", () => {
    if (!gameOver) {
        bird.velocity = bird.lift;
    } else {
        resetGame();
    }
});

function drawBird() {
    context.drawImage(bird.image, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        context.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.top);
        context.drawImage(pipeImage, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function drawCoins() {
    coins.forEach(coin => {
        context.drawImage(coinImages[coin.type], coin.x, coin.y, coinSize, coinSize);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
        setGameOver();
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    if (frame % 120 === 0) {
        const top = Math.random() * (canvas.height - pipeGap - 200);
        const bottom = canvas.height - top - pipeGap;
        pipes.push({ x: canvas.width, top: top, bottom: bottom, passed: false });
        addCoinInGap(canvas.width + pipeWidth, top, pipeGap);
        addCoinAboveGap(canvas.width + pipeWidth + 150, top);
        addCoinBelowGap(canvas.width + pipeWidth + 300, top, pipeGap, canvas.height);
    }
    pipes.forEach(pipe => {
        pipe.x -= 3;
    });
    pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function addCoinInGap(x, top, gap) {
    const coinY = top + (gap / 2) - (coinSize / 2);
    addCoin(x, coinY);
}

function addCoinAboveGap(x, top) {
    const coinY = Math.random() * (top - coinSize);
    addCoin(x, coinY);
}

function addCoinBelowGap(x, top, gap, canvasHeight) {
    const coinY = top + gap + Math.random() * (canvasHeight - top - gap - coinSize);
    addCoin(x, coinY);
}

function addCoin(x, y) {
    const type = Math.floor(Math.random() * coinImages.length);
    coins.push({ x, y, type });
}

function updateCoins() {
    coins.forEach(coin => {
        coin.x -= 3;
    });
    coins.filter(coin => coin.x + coinSize > 0);
}

function checkCollision() {
    pipes.forEach(pipe => {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
            setGameOver();
        }
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.passed = true;
            updateScoreboard();
        }
    });

    coins.forEach((coin, index) => {
        if (bird.x + bird.width > coin.x && bird.x < coin.x + coinSize &&
            bird.y + bird.height > coin.y && bird.y < coin.y + coinSize) {
            points++;
            coins.splice(index, 1);
            updateScoreboard();
        }
    });
}

function setGameOver() {
    gameOver = true;
    if (score > bestScore) {
        bestScore = score;
    }
    context.fillStyle = "red";
    context.font = "30px Arial";
    context.fillText("Game Over", canvas.width / 4, canvas.height / 2);
    context.font = "16px Arial";
    context.fillText("Press any key to start over", canvas.width / 3, canvas.height / 2 + 40);
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    coins.length = 0;
    score = 0;
    points = 0;
    frame = 0;
    gameOver = false;
    updateScoreboard();
    startSoundtrack();
}

function drawScore() {
    context.fillStyle = "black";
    context.font = "16px Arial";
    context.fillText(`Score: ${score}`, 10, 20);
}

function updateScoreboard() {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.innerHTML = `Score: ${score}<br>Best: ${bestScore}<br>Points: ${points}`;
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameOver) {
        drawBird();
        drawPipes();
        drawCoins();
        updateBird();
        updatePipes();
        updateCoins();
        checkCollision();
        frame++;
    } else {
        setGameOver();
    }
    requestAnimationFrame(gameLoop);
}

const gameContainer = document.getElementById("game-container");
const scoreboard = document.createElement("div");
scoreboard.id = "scoreboard";
scoreboard.style.position = "absolute";
scoreboard.style.top = "10px";
scoreboard.style.left = "10px";
scoreboard.style.color = "white";
scoreboard.style.fontSize = "20px"; // Make the text larger for better visibility
gameContainer.appendChild(scoreboard);
updateScoreboard();

gameLoop();
