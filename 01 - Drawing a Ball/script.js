//store the canvas element in a variable
const canvas = document.getElementById('canvas');
//define the rendering context 
const ctx = canvas.getContext('2d');

//a function that draws a circle and fills it with a color
function drawBall(x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

//calling the function twice
drawBall(100, 100, 20);
drawBall(200, 200, 30);
