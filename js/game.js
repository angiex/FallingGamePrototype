var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var playButton = document.getElementById("play");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var startScreen = true;
var isRunning = false;
var lastTimestamp = 0;
var basket = null;
var score = 0;
var lives = 3;

var portraitMode = window.innerWidth < window.innerHeight;

var basketWidth = portraitMode ? Math.floor(canvas.width / 5) : Math.floor(canvas.width / 8);
var basketHeight = basketWidth * 0.5;
var coinRadius = basketHeight * 0.4;
var bombRadius = basketHeight * 0.4;
var basketHeightPosition = canvas.height - basketHeight; // position basket on the ground
const GEN_SPEED = 800; // in ms
const BOMB_PROBABILITY = 0.2; // 1/5 falling ojects is a bomb
const FRAME_RATE = 60;
const FRAME_DURATION = 1000 / FRAME_RATE;

/************************************ USER MESSAGES *****************************************/

function setUpStartScreen() {
    ctx.fillStyle = "white";
    ctx.font = "30px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Tap to start", Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
}

setUpStartScreen();

/************************************ EVENTLISTENER *****************************************/

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    portraitMode = window.innerWidth < window.innerHeight;
    basketWidth = portraitMode ? Math.floor(canvas.width / 5) : Math.floor(canvas.width / 8);
    basketHeight = basketWidth * 0.5;
    coinRadius = basketHeight * 0.4;
    bombRadius = basketHeight * 0.4;
    basketHeightPosition = canvas.height - basketHeight;

    if (startScreen) {
        setUpStartScreen();
    } else if (isRunning) {
        basket = new Basket(
            Math.floor((Basket.width + canvas.width) / 2),
            basketHeightPosition,
            basketWidth,
            basketHeight
        );
    }
})

canvas.addEventListener("click", () => {
    if(!isRunning) {
        playGame();
    }
});

document.addEventListener("keydown", (event) => {
    if (!isRunning) {
        return;
    }
    let moveDistance = basketWidth / 2;
    switch(event.keyCode) {
        case 37:
            basket.move(-moveDistance);
            return;
        case 39:
            basket.move(moveDistance);
            return;
    }
}, true);

var moveBasketWithMouse = (event) => {
    if (!isRunning) {
        return;
    }
    if(event.clientX - (basketWidth / 2) < 0) {
        basket.x = 0;
    } else if (event.clientX > canvas.width - basketWidth) {
        basket.x = canvas.width - basketWidth;
    } else {
        basket.x = event.clientX - (basketWidth / 2);
    }
};

document.body.addEventListener("mouseenter", moveBasketWithMouse);
document.body.addEventListener("mousemove", moveBasketWithMouse);

window.addEventListener("deviceorientation", (event) => {
    if (!isRunning) {
        return;
    }
    let leftRightMov = event.gamma; // [-90; 90]
    basket.move(leftRightMov);
}, true);

/************************************ OBJECTS ***********************************************/

// Coins: Catch coins to get points
var Coin = class Coin {
    constructor(x, y, radius, descentSpeed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.descentSpeed = descentSpeed; // in ms
    }
};

Coin.prototype.draw = function() {
    ctx.fillStyle = "#ffcc66";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.stroke();
    ctx.fill();
};

Coin.prototype.fall = function(msElapsed) {
    this.y += this.descentSpeed * msElapsed;
};

// Bombs: avoid bombs
var Bomb = class Bomb {
    constructor(x, y, radius, descentSpeed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.descentSpeed = descentSpeed;
    }
};

Bomb.prototype.draw = function() {
    ctx.fillStyle = "#ff4d4d";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.stroke();
    ctx.fill();
};

Bomb.prototype.fall = function(msElapsed) {
    this.y += this.descentSpeed * msElapsed;
};

// Basket: The player moves the basket
var Basket = class Basket {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
};

Basket.prototype.draw = function() {
    ctx.fillStyle = "#80dfff";
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

Basket.prototype.move = function(leftRightMov) {
    if (this.x + leftRightMov < 0) {
        this.x = 0;
        return;
    } else if (this.x + leftRightMov > canvas.width - basketWidth) {
        this.x = canvas.width - basketWidth;
        return;
    }
    this.x += leftRightMov;
}

/************************************ GENERATOR *********************************************/

fallers = [];

var startGenerating = () => {
    generate = setInterval(() => {
        let xPos;
        let rollForObject = Math.random();
        let object;
        if (rollForObject < BOMB_PROBABILITY) {
            xPos = bombRadius + Math.random() * (canvas.width - bombRadius);
            object = new Bomb(xPos, 0, bombRadius, 1);
        } else {
            xPos = coinRadius + Math.random() * (canvas.width - coinRadius);
            object = new Coin(xPos, 0, coinRadius, 1);
        }
        fallers.push(object);
    }, GEN_SPEED);
};

var stopGenerating = () => clearInterval(generate);

/************************************ GAME LOGIC ********************************************/

function basketCaughtObject(object) {
    let xCoordMatches = 
    (object.x - object.radius >= basket.x) && (object.x + object.radius <= basket.x + basketWidth);
    let yCoordMatches = object.y >= basket.y;
    let caught = xCoordMatches && yCoordMatches;
    if(caught) {
        if(object instanceof Coin) {
            score++;
        } else {
            lives--;
        }
    }
    return caught;
};

function drawScoreCount() {
    ctx.fillStyle = "white";
    ctx.font = "30px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, Math.floor(canvas.width / 2), Math.floor(canvas.height*0.1));
}

function drawLifeCount() {
    ctx.fillStyle = "red";
    ctx.font = "30px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(lives, Math.floor(canvas.width * 0.8), Math.floor(canvas.height*0.1));
}

function gameOver() {
    stopGenerating();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isRunning = false;
    fallers = [];

    ctx.fillStyle = "white";
    ctx.font = "30px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
        "Game Over - Total score: " + score,
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height * 0.4)
    );
    ctx.fillText(
        "Try again? Tap to start.",
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height * 0.6)
    );
}

function drawObjects(msElapsed) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fallers.forEach((faller) => {
        faller.draw();
        faller.fall(msElapsed);
    });

    basket.draw();

    fallers = fallers.filter((object) => {
        return !basketCaughtObject(object);
    });
    fallers = fallers.filter((object) => {
        return object.y < canvas.height;
    });

    drawScoreCount();
    drawLifeCount();
};

var nextFrame = function(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    
    if (timestamp - lastTimestamp < FRAME_DURATION) {
        if (isRunning) {
            window.requestAnimationFrame(nextFrame);
        }

        return;
    }

    drawObjects(timestamp - lastTimestamp);
    lastTimestamp = timestamp;

    if(lives <= 0) {
        gameOver();
    }

    if (isRunning) {
        window.requestAnimationFrame(nextFrame);
    }
};

function playGame() {
    isRunning = true;
    startScreen = false;
    lastTimestamp = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    basket = new Basket(Math.floor((Basket.width + canvas.width) / 2), basketHeightPosition, basketWidth, basketHeight);
    startGenerating();
    window.requestAnimationFrame(nextFrame);
};