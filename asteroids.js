let canvas;
let ctx;
let canvasWidth = window.innerWidth*.85;
let canvasHeight = window.innerHeight*.85;
let keys = [];
let ship;
let bullets = [];
let asteroids = [];
let score = 0;
let lives = 5;

//See if this can be removed.
let highScore;
let localStorageName = "HighScore";

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas(){
    canvas = document.getElementById("my-canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();

    // Store all possible keycodes in an array so that
    // multiple keys can work at the same time
    // document.body.addEventListener("keydown", function(e) {
    //     keys[e.keyCode] = true;
    // });
    // document.body.addEventListener("keyup", function(e) {
    //     keys[e.keyCode] = false;
    //     if (e.keyCode === 32){
    //         bullets.push(new Bullet(ship.angle));
    //     }
    // });
    document.body.addEventListener("keydown", HandleKeyDown);
    document.body.addEventListener("keyup", HandleKeyUp);
    //Add Start button
    //document.body.addEventListener("start", HandleKeyUp);

    // Retrieves locally stored high scores
    // To Do: Change to REST call insted.
    if (localStorage.getItem(localStorageName) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(localStorageName);
    }



    Render();
}


// Move event handling functions so that we can turn off
// event handling if game over is reached
// Event handling this code probably just needs to be changed. it's not really all that good
function HandleKeyDown(e){
    keys[e.keyCode] = true;
}
function HandleKeyUp(e){
    keys[e.keyCode] = false;
    if (e.keyCode === 32){
        bullets.push(new Bullet(ship.angle));
    }
}

class Ship {
    constructor() {
        this.visible = true;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.movingForward = false;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.rotateSpeed = 0.001;
        this.radius = 15;
        this.angle = 0;
        this.strokeColor = 'white';
        // Used to know where to fire the bullet from
        this.noseX = canvasWidth / 2 + 15;
        this.noseY = canvasHeight / 2;
    }
    Rotate(dir) {
        this.angle += this.rotateSpeed * dir;
    }
    Update() {
        // Get current direction ship is facing
        let radians = this.angle / Math.PI * 180;

        // If moving forward calculate changing values of x & y
        // If you want to find the new point x use the
        // formula oldX + cos(radians) * distance
        // Forumla for y oldY + sin(radians) * distance
        if (this.movingForward) {
            this.velX += Math.cos(radians) * this.speed;
            this.velY += Math.sin(radians) * this.speed;
        }
        // If ship goes off board place it on the opposite
        // side
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
        // Slow ship speed when not holding key
        this.velX *= 0.99;
        this.velY *= 0.99;

        // Change value of x & y while accounting for
        // air friction
        this.x -= this.velX;
        this.y -= this.velY;
    }
    Draw() {
        ctx.strokeStyle = this.strokeColor;
        ctx.beginPath();
        // Angle between vertices of the ship
        let vertAngle = ((Math.PI * 2) / 3);

        let radians = this.angle / Math.PI * 180;
        // Where to fire bullet from
        this.noseX = this.x - this.radius * Math.cos(radians);
        this.noseY = this.y - this.radius * Math.sin(radians);

        //Changed the way the ship looked to be more in keeping with origial asteroids. Also allows you to see where the ship is
        //pointed.
        ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * 0 + radians), this.y - this.radius * Math.sin(vertAngle * 0 + radians));
        ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * 1 + radians), this.y - this.radius * Math.sin(vertAngle * 1 + radians));
        ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * 0 + radians), this.y - this.radius * Math.sin(vertAngle * 0 + radians));
        ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * 2 + radians), this.y - this.radius * Math.sin(vertAngle * 2 + radians));
        ctx.closePath();
        ctx.stroke();


        //hitbox code uncomment to see hitbox
        //ctx.beginPath();
        //ctx.arc(this.x, this.y, 11, 0, 2 * Math.PI);
        //ctx.stroke();
    }
}

class Bullet{
    constructor(angle) {
        this.visible = true;
        this.x = ship.noseX;
        this.y = ship.noseY;
        this.angle = angle;
        this.height = 4;
        this.width = 4;
        this.speed = 5;
        this.velX = 0;
        this.velY = 0;
    }
    Update(){
        let radians = this.angle / Math.PI * 180;
        this.x -= Math.cos(radians) * this.speed;
        this.y -= Math.sin(radians) * this.speed;
    }
    Draw(){
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}

class Asteroid{
    constructor(x,y,radius,level,collisionRadius) {
        this.visible = true;
        this.x = x || Math.floor(Math.random() * canvasWidth);
        this.y = y || Math.floor(Math.random() * canvasHeight);
        this.speed = 3;
        //testing speed
        //this.speed = 0;
        this.radius = radius || 50;
        this.angle = Math.floor(Math.random() * 359);
        this.strokeColor = 'white';
        this.collisionRadius = collisionRadius || 46;
        // Used to decide if this asteroid can be broken into smaller pieces
        this.level = level || 1;
    }
    Update(){
        let radians = this.angle / Math.PI * 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
    }
    Draw(){
        ctx.beginPath();
        let vertAngle = ((Math.PI * 2) / 6);
        var radians = this.angle / Math.PI * 180;
        for(let i = 0; i < 6; i++){
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();

        //hitbox astroid
        //ctx.beginPath();
        //ctx.arc(this.x, this.y, this.collisionRadius, 0, 2 * Math.PI);
        //ctx.stroke();
    }
}

// Works fine. I actually like this better than point checks.
function CircleCollision(p1x, p1y, r1, p2x, p2y, r2){
    let radiusSum;
    let xDiff;
    let yDiff;

    radiusSum = r1 + r2;
    xDiff = p1x - p2x;
    yDiff = p1y - p2y;

    if (radiusSum > Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))) {
        return true;
    } else {
        return false;
    }
}

// Handles drawing life ships on screen
// Make this better current version is bad.
// To Do: change idiots code.
function DrawLifeShips(){
    let startX = canvasWidth-30;
    let startY = 10;
    let points = [[5, 8], [6, -9]];
    ctx.strokeStyle = 'white'; // Stroke color of ships

    // Cycle through all live ships remaining
    for(let i = 0; i < lives; i++){
        // Start drawing ship
        ctx.beginPath();
        // Move to origin point
        ctx.moveTo(startX, startY);
        // Cycle through all other points
        for(let j = 0; j < points.length; j++){
            ctx.lineTo(startX + points[j][0],
                startY + points[j][1]);
        }
        // Draw from last point to 1st origin point
        //ctx.closePath();
        // Stroke the ship shape white
        ctx.stroke();
        // Move next shape 30 pixels to the left
        startX -= 30;
    }
}

//function to start a new level.
function newLevel(numAsteroids, level){
    for(let i = 0; i < numAsteroids; i++){
        //Changed code prevents death on first spawn. Could run forever but probably won't
        asteroid = new Asteroid();
        asteroid.speed = 3 + (level*.5);
        if(!(CircleCollision(ship.x, ship.y, ship.radius, asteroid.x, asteroid.y, asteroid.collisionRadius*4))){
            asteroids.push(asteroid);
        }
        else{
            i--;
        }
    }
}

function DisplayScore(){
    ctx.fillStyle = 'white';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE : " + score.toString(), 20, 35);
}

//Change this to a REST call
function DisplayHighScore(){
    highScore = Math.max(score, highScore);
    localStorage.setItem(localStorageName, highScore);
    ctx.font = '21px Arial';
    ctx.fillText("HIGH SCORE : " + highScore.toString(), 20, 70);
}

function Render() {
    let level = 0;
    let numAsteroids = ;
    // Check if the ship is moving forward
    ship.movingForward = (keys[87])|(keys[38]);

    if ((keys[68])||(keys[39])) {
        // d key and right arrow key to roate right
        ship.Rotate(1);
    }
    if ((keys[65])||(keys[37])) {
        // a key and left arrow key to rotate left
       ship.Rotate(-1);
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    DisplayScore();

    // If no lives signal game over
    if(lives <= 0){
        // If Game over remove event listeners to stop getting keyboard input
        // To Do: get rid of this crap. We just want the Game over screen to be up for a second.
        document.body.removeEventListener("keydown", HandleKeyDown);
        document.body.removeEventListener("keyup", HandleKeyUp);

        ship.visible = false;
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2);
    }

    // Checks to see if new level is reached
    if(asteroids.length === 0){
        level++;
        newLevel(numAsteroids, level);
    }

    // Draw life ships
    DrawLifeShips();

    // Check for collision of ship with asteroid
    for(let k = 0; k < asteroids.length; k++){
        if(CircleCollision(ship.x, ship.y, 11, asteroids[k].x, asteroids[k].y, asteroids[k].collisionRadius)){
            ship.x = canvasWidth / 2;
            ship.y = canvasHeight / 2;
            ship.velX = 0;
            ship.velY = 0;
            lives -= 1;
        }
    }


    //Oh god I don't even know wwhere to start with this shit
    // Check for collision with bullet and asteroid
    if (asteroids.length !== 0 && bullets.length != 0){
loop1:
        for(let l = 0; l < asteroids.length; l++){
            for(let m = 0; m < bullets.length; m++){
                if(CircleCollision(bullets[m].x, bullets[m].y, 3, asteroids[l].x, asteroids[l].y, asteroids[l].collisionRadius)){
                    // Check if asteroid can be broken into smaller pieces
                    if(asteroids[l].level === 1){
                        asteroids.push(new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 25, 2, 22));
                        asteroids.push(new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 25, 2, 22));
                    } else if(asteroids[l].level === 2){
                        asteroids.push(new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 15, 3, 12));
                        asteroids.push(new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 15, 3, 12));
                    }
                    asteroids.splice(l,1);
                    bullets.splice(m,1);
                    score += 20;

                    // Used to break out of loops because splicing arrays
                    // you are looping through will break otherwise
                    // ToDo: This is stupid but I don't have a fix yet. Change this idiots code.
                    break loop1;
                }
            }
        }
    }

    if(ship.visible){
        ship.Update();
        ship.Draw();
    }

    if (bullets.length !== 0) {
        for(let i = 0; i < bullets.length; i++){
            bullets[i].Update();
            bullets[i].Draw();
        }
    }
    if (asteroids.length !== 0) {
        for(let j = 0; j < asteroids.length; j++){
            asteroids[j].Update();
            // Pass j so we can track which asteroid points
            // to store
            asteroids[j].Draw(j);
        }
    }

    DisplayHighScore();

    requestAnimationFrame(Render);
}
