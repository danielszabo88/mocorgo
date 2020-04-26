const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BALLZ = [];
const WALLZ = [];
const CAPS = [];

let LEFT, UP, RIGHT, DOWN;
let friction = 0.05;

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    static cross(v1, v2){
        return v1.x*v2.y - v1.y*v2.x;
    }
}

class Matrix{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (let i = 0; i<this.rows; i++){
            this.data[i] = [];
            for (let j=0; j<this.cols; j++){
                this.data[i][j] = 0;
            }
        }
    }

    multiplyVec(vec){
        let result = new Vector(0,0);
        result.x = this.data[0][0]*vec.x + this.data[0][1]*vec.y;
        result.y = this.data[1][0]*vec.x + this.data[1][1]*vec.y;
        return result;
    }
}

class Ball{
    constructor(x, y, r, m){
        this.pos = new Vector(x,y);
        this.r = r;
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.elasticity = 1;
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 1;
        this.player = false;
        BALLZ.push(this);
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    display(){
        this.vel.drawVec(this.pos.x, this.pos.y, 10, "green");
        ctx.fillStyle = "black";
        ctx.fillText("m = "+this.m, this.pos.x-10, this.pos.y-5);
        ctx.fillText("e = "+this.elasticity, this.pos.x-10, this.pos.y+5);
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel);
    }

    keyControl(){
        if(LEFT){
            this.acc.x = -this.acceleration;
        }
        if(UP){
            this.acc.y = -this.acceleration;
        }
        if(RIGHT){
            this.acc.x = this.acceleration;
        }
        if(DOWN){
            this.acc.y = this.acceleration;
        }
        if(!LEFT && !RIGHT){
            this.acc.x = 0;
        }
        if(!UP && !DOWN){
            this.acc.y = 0;
        }
    }
}

class Capsule{
    constructor(x1, y1, x2, y2, r, m){
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2,y2);
        this.r = r;
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.elasticity = 1;
        this.length = this.end.subtr(this.start).mag();
        this.refDir = this.end.subtr(this.start).unit();
        this.dir = this.end.subtr(this.start).unit();
        this.pos = this.start.add(this.end).mult(0.5);
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 1;
        this.angVel = 0;
        this.angle = 0;
        this.refAngle = Math.acos(Vector.dot(this.end.subtr(this.start).unit(), new Vector(1,0)));
        if (Vector.cross(this.end.subtr(this.start).unit(), new Vector(1,0)) > 0){
            this.refAngle *= -1;
        }
        this.player = false;
        CAPS.push(this);
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.start.x, this.start.y, this.r, this.refAngle+this.angle+Math.PI/2, this.refAngle+this.angle+3*Math.PI/2);
        ctx.arc(this.end.x, this.end.y, this.r, this.refAngle+this.angle-Math.PI/2, this.refAngle+this.angle+Math.PI/2);
        ctx.closePath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        //ctx.fillStyle = "lightgreen";
        //ctx.fill(); 
    }

    keyControl(){
        if(UP){
            this.acc = this.dir.mult(-this.acceleration);;
        }
        if(DOWN){
            this.acc = this.dir.mult(this.acceleration);;
        }
        if(LEFT){
            this.angVel = -0.1;
        }
        if(RIGHT){
            this.angVel = 0.1;
        }
        if(!UP && !DOWN){
            this.acc = new Vector(0,0);
        }
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel);
        this.angle += this.angVel;
        this.angVel *= 0.95;
        let rotMat = rotMx(this.angle);
        this.dir = rotMat.multiplyVec(this.refDir);
        this.start = this.pos.add(this.dir.mult(-this.length/2));
        this.end = this.pos.add(this.dir.mult(this.length/2));
    }
}

class Wall{
    constructor(x1, y1, x2, y2){
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.dir = this.end.subtr(this.start).unit();
        this.center = this.start.add(this.end).mult(0.5);
        this.length = this.end.subtr(this.start).mag();
        this.refStart = new Vector(x1, y1);
        this.refEnd = new Vector(x2, y2);
        this.refUnit = this.end.subtr(this.start).unit();
        this.angVel = 0;
        this.angle = 0;
        WALLZ.push(this);
    }

    drawWall(){
        let rotMat = rotMx(this.angle);
        let newDir = rotMat.multiplyVec(this.refUnit);
        this.start = this.center.add(newDir.mult(-this.length/2));
        this.end = this.center.add(newDir.mult(this.length/2));
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    keyControl(){
        if(LEFT){
            this.angVel = -0.1;
        }
        if(RIGHT){
            this.angVel = 0.1;
        }
    }

    reposition(){
        this.angle += this.angVel;
        this.angVel *= 0.99;
    }
}

function userInput(){
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
}

function round(number, precision){
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}

function randInt(min, max){
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function rotMx(angle){
    let mx = new Matrix(2,2);
    mx.data[0][0] = Math.cos(angle);
    mx.data[0][1] = -Math.sin(angle);
    mx.data[1][0] = Math.sin(angle);
    mx.data[1][1] = Math.cos(angle);
    return mx;
}

function closestPointOnLS(p, w1){
    let ballToWallStart = w1.start.subtr(p);
    if(Vector.dot(w1.dir, ballToWallStart) > 0){
        return w1.start;
    }

    let wallEndToBall = p.subtr(w1.end);
    if(Vector.dot(w1.dir, wallEndToBall) > 0){
        return w1.end;
    }

    let closestDist = Vector.dot(w1.dir, ballToWallStart);
    let closestVect = w1.dir.mult(closestDist);
    return w1.start.subtr(closestVect);
}

function closestPointsBetweenLS(c1, c2){
    let shortestDist = closestPointOnLS(c1.start, c2).subtr(c1.start).mag();
    let closestPoints = [c1.start, closestPointOnLS(c1.start, c2)];
    if(closestPointOnLS(c1.end, c2).subtr(c1.end).mag() < shortestDist){
        shortestDist = closestPointOnLS(c1.end, c2).subtr(c1.end).mag();
        closestPoints = [c1.end, closestPointOnLS(c1.end, c2)];
    }
    if(closestPointOnLS(c2.start, c1).subtr(c2.start).mag() < shortestDist){
        shortestDist = closestPointOnLS(c2.start, c1).subtr(c2.start).mag();
        closestPoints = [closestPointOnLS(c2.start, c1), c2.start];
    }
    if(closestPointOnLS(c2.end, c1).subtr(c2.end).mag() < shortestDist){
        shortestDist = closestPointOnLS(c2.end, c1).subtr(c2.end).mag();
        closestPoints = [closestPointOnLS(c2.end, c1), c2.end];
    }
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(closestPoints[0].x, closestPoints[0].y);
    ctx.lineTo(closestPoints[1].x, closestPoints[1].y);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(closestPoints[0].x, closestPoints[0].y, c1.r, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(closestPoints[1].x, closestPoints[1].y, c2.r, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    return closestPoints;
}

function coll_det_bb(b1, b2){
    if(b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()){
        return true;
    } else {
        return false;
    }
}

function coll_det_bw(b1, w1){
    let ballToClosest = closestPointOnLS(b1.pos, w1).subtr(b1.pos);
    if (ballToClosest.mag() <= b1.r){
        return true;
    }
}

//Capsule - Capsule collision detection
function coll_det_cc(c1, c2){
    if(c1.r + c2.r >= closestPointsBetweenLS(c1, c2)[0].subtr(closestPointsBetweenLS(c1, c2)[1]).mag()){
        return true;
    } else {
        return false;
    }
}

function pen_res_bb(b1, b2){
    let dist = b1.pos.subtr(b2.pos);
    let pen_depth = b1.r + b2.r - dist.mag();
    let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

function pen_res_bw(b1, w1){
    let penVect = b1.pos.subtr(closestPointOnLS(b1.pos, w1));
    b1.pos = b1.pos.add(penVect.unit().mult(b1.r-penVect.mag()));
}

//Capsule - Capsule penetration resolution
function pen_res_cc(c1, c2){
    let dist = closestPointsBetweenLS(c1, c2)[0].subtr(closestPointsBetweenLS(c1, c2)[1]);
    let pen_depth = c1.r + c2.r - dist.mag();
    let pen_res = dist.unit().mult(pen_depth / (c1.inv_m + c2.inv_m));
    c1.pos = c1.pos.add(pen_res.mult(c1.inv_m));
    c2.pos = c2.pos.add(pen_res.mult(-c2.inv_m));
}

function coll_res_bb(b1, b2){
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);
    
    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse);

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
}

function coll_res_bw(b1, w1){
    let normal = b1.pos.subtr(closestPointOnLS(b1.pos, w1)).unit();
    let sepVel = Vector.dot(b1.vel, normal);
    let new_sepVel = -sepVel * b1.elasticity;
    let vsep_diff = sepVel - new_sepVel;
    b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

//Capsule - Capsule linear collision response
function coll_res_cc(c1, c2){
    let normal = closestPointsBetweenLS(c1, c2)[0].subtr(closestPointsBetweenLS(c1, c2)[1]).unit();
    let relVel = c1.vel.subtr(c2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let new_sepVel = -sepVel * Math.min(c1.elasticity, c2.elasticity);
    
    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (c1.inv_m + c2.inv_m);
    let impulseVec = normal.mult(impulse);

    c1.vel = c1.vel.add(impulseVec.mult(c1.inv_m));
    c2.vel = c2.vel.add(impulseVec.mult(-c2.inv_m));
}

function momentum_display(){
    let momentum = Ball1.vel.add(Ball2.vel).mag();
    ctx.fillText("Momentum: "+round(momentum, 4), 500, 330);
}

function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    userInput();
    BALLZ.forEach((b, index) => {
        b.drawBall();
        if (b.player){
            b.keyControl();
        }
        WALLZ.forEach((w) => {
            if(coll_det_bw(BALLZ[index], w)){
                pen_res_bw(BALLZ[index], w);
                coll_res_bw(BALLZ[index], w);
            }
        })
        for(let i = index+1; i<BALLZ.length; i++){
            if(coll_det_bb(BALLZ[index], BALLZ[i])){
                pen_res_bb(BALLZ[index], BALLZ[i]);
                coll_res_bb(BALLZ[index], BALLZ[i]);
            }
        }
        b.display();
        b.reposition();
    });

    WALLZ.forEach((w) => {
        w.drawWall();
        w.keyControl();
        w.reposition();
    })

    CAPS.forEach((c, index) => {
        c.draw();
        if(c.player === true){
            c.keyControl();
        }
        for(let i = index+1; i<CAPS.length; i++){
            if(coll_det_cc(CAPS[index], CAPS[i])){
                ctx.fillText("Collide", 500, 400);
                pen_res_cc(CAPS[index], CAPS[i]);
                coll_res_cc(CAPS[index], CAPS[i]);
            }
        }
        c.reposition();
    })

    closestPointsBetweenLS(Caps1, Caps2);
    requestAnimationFrame(mainLoop);
}

let Caps1 = new Capsule(300, 200, 400, 300, 40, 2);
let Caps2 = new Capsule(150, 50, 150, 300, 30, 3);
Caps1.player = true;



requestAnimationFrame(mainLoop);

