var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var playButton = document.getElementById("play");

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

var isRunning = false;
var lastTimestamp = 0;
var basket = null;

var smallDevice = window.innerWidth < 1200;

const DEFAULT_BASKET_WIDTH = smallDevice ? 200 : (window.innerWidth / 10);
const DEFAULT_BASKET_HEIGHT = smallDevice ? 130 : (DEFAULT_BASKET_WIDTH * 0.5);
const COIN_RADIUS = DEFAULT_BASKET_HEIGHT * 0.4;
const BOMB_RADIUS = DEFAULT_BASKET_HEIGHT * 0.4;
const BASKET_HEIGHT_POSITION = canvas.height - DEFAULT_BASKET_HEIGHT; // position basket on the ground
const GEN_SPEED = 1000; // in ms; generate 1 falling object per sec)
const BOMB_PROBABILITY = 0.2; // 1/5 falling ojects is a bomb
const FRAME_RATE = 60;
const FRAME_DURATION = 1000 / FRAME_RATE;

/************************************ EVENTLISTENER *****************************************/
playButton.addEventListener("click", () => {
    // testDraw();
    playGame();
});

window.addEventListener("deviceorientation", handleOrientation, true);

function handleOrientation(event) {
    if (!isRunning) {
        return;
    }
    let leftRightMov = event.gamma; // [-90; 90]
    basket.move(leftRightMov);
};

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
    ctx.fillStyle = "orange";
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
    ctx.fillStyle = "black";
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
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
};

Basket.prototype.move = function(leftRightMov) {
    // don't let the basket move outside the canvas
    if (this.x + leftRightMov < 0) {
        this.x = 0
        return;
    } else if (this.x + leftRightMov > canvas.width - DEFAULT_BASKET_WIDTH) {
        this.x = canvas.width - DEFAULT_BASKET_WIDTH;
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
            xPos = BOMB_RADIUS + Math.random() * (canvas.width + BOMB_RADIUS);
            object = new Bomb(xPos, 0, BOMB_RADIUS, 1);
        } else {
            xPos = COIN_RADIUS + Math.random() * (canvas.width + COIN_RADIUS);
            object = new Coin(xPos, 0, COIN_RADIUS, 1);
        }
        fallers.push(object);
    }, GEN_SPEED);
};

var stopGenerating = () => clearInterval(generate);

/************************************ GAME LOGIC ********************************************/

function testDraw() {
    // testing
    let coin = new Coin(100, 100, COIN_RADIUS);
    let bomb = new Bomb(100, 200, BOMB_RADIUS);
    let basket = new Basket(100, BASKET_HEIGHT_POSITION, DEFAULT_BASKET_WIDTH, DEFAULT_BASKET_HEIGHT);
    bomb.draw();
    coin.draw();
    basket.draw();
};

function drawObjects(msElapsed) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fallers.forEach((faller) => {
        faller.draw();
        faller.fall(msElapsed);
    });

    basket.draw();

    fallers = fallers.filter((object) => {
        return object.y < canvas.height;
    });
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
    if (isRunning) {
        window.requestAnimationFrame(nextFrame);
    }
};

function playGame() {
    isRunning = true;
    lastTimestamp = 0;
    basket = new Basket(100, BASKET_HEIGHT_POSITION, DEFAULT_BASKET_WIDTH, DEFAULT_BASKET_HEIGHT);
    startGenerating();
    window.requestAnimationFrame(nextFrame);
};