//Event listeners for the arrow keys
function userInput(obj){
    canvas.addEventListener('keydown', function(e){
        if(e.code === "ArrowLeft"){
            obj.left = true;
        }
        if(e.code === "ArrowUp"){
            obj.up = true;
        }
        if(e.code === "ArrowRight"){
            obj.right = true;
        }
        if(e.code === "ArrowDown"){
            obj.down = true;
        }
        if(e.code === "Space"){
            obj.action = true;
        }
    });
    
    canvas.addEventListener('keyup', function(e){
        if(e.code === "ArrowLeft"){
            obj.left = false;
        }
        if(e.code === "ArrowUp"){
            obj.up = false;
        }
        if(e.code === "ArrowRight"){
            obj.right = false;
        }
        if(e.code === "ArrowDown"){
            obj.down = false;
        }
        if(e.code === "Space"){
            obj.action = false;
        }
    });    
}
