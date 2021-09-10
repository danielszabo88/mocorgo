// STEP 1: setting up the environment
// creating the starting objects and variables before starting the main loop
// for example: 
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.focus();

putWallsAround(0, 0, canvas.clientWidth, canvas.clientHeight);
let player = new Ball(100, 100, 30, 5);
player.setColor("red");
player.maxSpeed = 5;

// STEP 2: defining the game logic
function gameLogic(){
    // this gets called periodically as part of the main loop
    // define the rules here
}

// handling the user input and the game loop
userInput(player);
requestAnimationFrame(mainLoop);