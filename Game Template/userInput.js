//Event listeners for the arrow keys
function userInput(obj){
    canvas.addEventListener('keydown', function(e){
        if(e.keyCode === 37){
            obj.left = true;
        }
        if(e.keyCode === 38){
            obj.up = true;
        }
        if(e.keyCode === 39){
            obj.right = true;
        }
        if(e.keyCode === 40){
            obj.down = true;
        }
        if(e.keyCode === 32){
            obj.action = true;
        }
    });
    
    canvas.addEventListener('keyup', function(e){
        if(e.keyCode === 37){
            obj.left = false;
        }
        if(e.keyCode === 38){
            obj.up = false;
        }
        if(e.keyCode === 39){
            obj.right = false;
        }
        if(e.keyCode === 40){
            obj.down = false;
        }
        if(e.keyCode === 32){
            obj.action = false;
        }
    });    
}
