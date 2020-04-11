const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;

//boolean variables - if true, ball moves in the direction
let LEFT, UP, RIGHT, DOWN;

function drawBall(x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

//direction booleans become true if the arrow key is pressed
canvas.addEventListener('keydown', function(e){
    if(e.keyCode === 37){
        LEFT = true;
    }
    if(e.keyCode === 38){
        UP = true;
    }
    if(e.keyCode === 39){
        RIGHT = true;
    }
    if(e.keyCode === 40){
        DOWN = true;
    }
});

//direction booleans become true if the arrow key is released
canvas.addEventListener('keyup', function(e){
    if(e.keyCode === 37){
        LEFT = false;
    }
    if(e.keyCode === 38){
        UP = false;
    }
    if(e.keyCode === 39){
        RIGHT = false;
    }
    if(e.keyCode === 40){
        DOWN = false;
    }
});

//changes the x or y position depending on the boolean values
function move(){
    if(LEFT){
        x--;
    }
    if(UP){
        y--;
    }
    if(RIGHT){
        x++;
    }
    if(DOWN){
        y++;
    }
}

//main loop that runs around 60 times per second
function mainLoop() {
    ctx.clearRect(0, 0, 640, 480);
    move();
    drawBall(x, y, 20);
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);

