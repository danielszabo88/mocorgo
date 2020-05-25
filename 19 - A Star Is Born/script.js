const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BODIES = [];
const COLLISIONS = [];

let LEFT, UP, RIGHT, DOWN;
let friction = 0;

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }  
   
    set(x, y){
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

    rotMx22(angle){
        this.data[0][0] = Math.cos(angle);
        this.data[0][1] = -Math.sin(angle);
        this.data[1][0] = Math.sin(angle);
        this.data[1][1] = Math.cos(angle);
    }
}

//classes storing the primitive shapes: Line, Circle, Rectangle, Triangle
class Line{
    constructor(x0, y0, x1, y1){
        this.vertex = [];
        this.vertex[0] = new Vector(x0, y0);
        this.vertex[1] = new Vector(x1, y1);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.mag = this.vertex[1].subtr(this.vertex[0]).mag();
        this.pos = new Vector((this.vertex[0].x+this.vertex[1].x)/2, (this.vertex[0].y+this.vertex[1].y)/2);
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }
}

class Circle{
    constructor(x, y, r){
        this.vertex = [];
        this.pos = new Vector(x, y);
        this.r = r;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.stroke();
        //ctx.fillStyle = "red";
        //ctx.fill();
        ctx.closePath();
    }
}

class Rectangle{
    constructor(x1, y1, x2, y2, w){
        this.vertex = [];
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.refDir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.length = this.vertex[1].subtr(this.vertex[0]).mag();
        this.width = w;
        this.vertex[2] = this.vertex[1].add(this.dir.normal().mult(this.width));
        this.vertex[3] = this.vertex[2].add(this.dir.normal().mult(-this.length));
        this.pos = this.vertex[0].add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(this.width/2));
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[3].x, this.vertex[3].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    getVertices(){
        this.rotMat.rotMx22(this.angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.dir.mult(-this.length/2)).add(this.dir.normal().mult(this.width/2));
        this.vertex[1] = this.pos.add(this.dir.mult(-this.length/2)).add(this.dir.normal().mult(-this.width/2));
        this.vertex[2] = this.pos.add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(-this.width/2));
        this.vertex[3] = this.pos.add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(this.width/2));
    }
}

class Triangle{
    constructor(x1, y1, x2, y2, x3, y3){
        this.vertex = [];
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.vertex[2] = new Vector(x3, y3);
        this.pos = new Vector((this.vertex[0].x+this.vertex[1].x+this.vertex[2].x)/3, (this.vertex[0].y+this.vertex[1].y+this.vertex[2].y)/3);
        this.dir = this.vertex[0].subtr(this.pos).unit();
        this.refDir = this.dir;
        this.refDiam = [];
        this.refDiam[0] = this.vertex[0].subtr(this.pos);
        this.refDiam[1] = this.vertex[1].subtr(this.pos);
        this.refDiam[2] = this.vertex[2].subtr(this.pos);
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    getVertices(){
        this.rotMat.rotMx22(this.angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[0]));
        this.vertex[1] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[1]));
        this.vertex[2] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[2]));
    }
}

//Parent class of the bodies (Ball, Capsule, Box, Star, Wall)
class Body{
    constructor(x, y){
        this.comp = [];
        this.pos = new Vector(x, y);
        this.m = 0;
        this.inv_m = 0;
        this.inertia = 0;
        this.inv_inertia = 0;
        this.elasticity = 1;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 1;
        this.angVel = 0;
        this.player = false;
        BODIES.push(this);
    }

    draw(){}
    display(){}
    reposition(){}
    keyControl(){}
}

class Ball extends Body{
    constructor(x, y, r, m){
        super();
        this.comp = [new Circle(x, y, r)];
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
    }

    draw(){
        this.comp[0].draw();
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
        this.comp[0].pos = this.comp[0].pos.add(this.vel);
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

class Capsule extends Body{
    constructor(x1, y1, x2, y2, r, m){
        super();
        this.comp = [new Circle(x1, y1, r), new Circle(x2, y2, r)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2*r));
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * ((2*this.comp[0].width)**2 +(this.comp[0].length+2*this.comp[0].width)**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    draw(){
        this.comp[0].draw();
        this.comp[1].draw();
        this.comp[2].draw();
    }

    keyControl(){
        if(UP){
            this.acc = this.comp[0].dir.mult(-this.acceleration);
        }
        if(DOWN){
            this.acc = this.comp[0].dir.mult(this.acceleration);
        }
        if(LEFT){
            this.angVel = -0.1;
        }
        if(RIGHT){
            this.angVel = 0.1;
        }
        if(!UP && !DOWN){
            this.acc.set(0, 0);
        }
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.comp[0].pos = this.comp[0].pos.add(this.vel);
        this.angVel *= 1;
        this.comp[0].angle += this.angVel;
        this.comp[0].getVertices();
        this.comp[1].pos = this.comp[0].pos.add(this.comp[0].dir.mult(-this.comp[0].length/2));
        this.comp[2].pos = this.comp[0].pos.add(this.comp[0].dir.mult(this.comp[0].length/2));
    }
}

class Box extends Body{
    constructor(x1, y1, x2, y2, w, m){
        super();
        this.comp = [new Rectangle(x1, y1, x2, y2, w)];
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * (this.comp[0].width**2 +this.comp[0].length**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    draw(){
        this.comp[0].draw();
    }

    keyControl(){
        if(UP){
            this.acc = this.comp[0].dir.mult(-this.acceleration);;
        }
        if(DOWN){
            this.acc = this.comp[0].dir.mult(this.acceleration);;
        }
        if(LEFT){
            this.angVel = -0.1;
        }
        if(RIGHT){
            this.angVel = 0.1;
        }
        if(!UP && !DOWN){
            this.acc.set(0,0);
        }
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.comp[0].pos = this.comp[0].pos.add(this.vel);
        this.angVel *= 1;
        this.comp[0].angle += this.angVel;
        this.comp[0].getVertices();
    }
}

class Star extends Body{
    constructor(x1, y1, r, m){
        super();
        this.comp = [];
        this.r = r;
        let center = new Vector(x1, y1);
        let upDir = new Vector(0, -1);
        let p1 = center.add(upDir.mult(r));
        let p2 = center.add(upDir.mult(-r/2)).add(upDir.normal().mult(-r*Math.sqrt(3)/2));
        let p3 = center.add(upDir.mult(-r/2)).add(upDir.normal().mult(r*Math.sqrt(3)/2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        p1 = center.add(upDir.mult(-r));
        p2 = center.add(upDir.mult(r/2)).add(upDir.normal().mult(-r*Math.sqrt(3)/2));
        p3 = center.add(upDir.mult(r/2)).add(upDir.normal().mult(r*Math.sqrt(3)/2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * ((2*this.r)**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    draw(){
        this.comp[0].draw();
        this.comp[1].draw();
    }

    keyControl(){
        if(UP){
            this.acc = this.comp[0].dir.mult(-this.acceleration);
        }
        if(DOWN){
            this.acc = this.comp[0].dir.mult(this.acceleration);
        }
        if(LEFT){
            this.angVel = -0.1;
        }
        if(RIGHT){
            this.angVel = 0.1;
        }
        if(!UP && !DOWN){
            this.acc.set(0,0);
        }
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.angVel *= 1;
        this.comp[0].pos = this.comp[0].pos.add(this.vel);
        this.comp[0].angle += this.angVel;
        this.comp[0].getVertices();
        this.comp[1].pos = this.comp[0].pos;
        this.comp[1].angle += this.angVel;
        this.comp[1].getVertices();
    }
}

class Wall extends Body{
    constructor(x1, y1, x2, y2){
        super();
        this.comp = [new Line(x1, y1, x2, y2)];
    }

    draw(){
        this.comp[0].draw();
    }
}

//Collision manifold, consisting the data for collision handling
//Manifolds are collected in an array for every frame
class CollData{
    constructor(o1, o2, normal, pen, cp){
        this.o1 = o1;
        this.o2 = o2;
        this.normal = normal;
        this.pen = pen;
        this.cp = cp;
    }

    penRes(){
        let penResolution = this.normal.mult(this.pen / (this.o1.inv_m + this.o2.inv_m));
        this.o1.comp[0].pos = this.o1.comp[0].pos.add(penResolution.mult(this.o1.inv_m));
        this.o2.comp[0].pos = this.o2.comp[0].pos.add(penResolution.mult(-this.o2.inv_m));
    }

    collRes(){
        //1. Closing velocity
        let collArm1 = this.cp.subtr(this.o1.comp[0].pos);
        let rotVel1 = new Vector(-this.o1.angVel * collArm1.y, this.o1.angVel * collArm1.x);
        let closVel1 = this.o1.vel.add(rotVel1);
        let collArm2 = this.cp.subtr(this.o2.comp[0].pos);
        let rotVel2= new Vector(-this.o2.angVel * collArm2.y, this.o2.angVel * collArm2.x);
        let closVel2 = this.o2.vel.add(rotVel2);

        //2. Impulse augmentation
        let impAug1 = Vector.cross(collArm1, this.normal);
        impAug1 = impAug1 * this.o1.inv_inertia * impAug1;
        let impAug2 = Vector.cross(collArm2, this.normal);
        impAug2 = impAug2 * this.o2.inv_inertia * impAug2;

        let relVel = closVel1.subtr(closVel2);
        let sepVel = Vector.dot(relVel, this.normal);
        let new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
        let vsep_diff = new_sepVel - sepVel;

        let impulse = vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2);
        let impulseVec = this.normal.mult(impulse);

        //3. Changing the velocities
        this.o1.vel = this.o1.vel.add(impulseVec.mult(this.o1.inv_m));
        this.o2.vel = this.o2.vel.add(impulseVec.mult(-this.o2.inv_m));

        this.o1.angVel += this.o1.inv_inertia * Vector.cross(collArm1, impulseVec);
        this.o2.angVel -= this.o2.inv_inertia * Vector.cross(collArm2, impulseVec); 
    }
}

//Event listeners for the arrow keys
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

function testCircle(x, y, color="black"){
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
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

//Separating axis theorem on two objects
//Returns with the details of the Minimum Translation Vector (or false if no collision)
function sat(o1, o2){
    let minOverlap = null;
    let smallestAxis;
    let vertexObj;

    let axes = findAxes(o1, o2);
    let proj1, proj2 = 0;
    let firstShapeAxes = getShapeAxes(o1);

    for(let i=0; i<axes.length; i++){
        proj1 = projShapeOntoAxis(axes[i], o1);
        proj2 = projShapeOntoAxis(axes[i], o2);
        let overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < 0){
            return false;
        }

        if((proj1.max > proj2.max && proj1.min < proj2.min) ||
          (proj1.max < proj2.max && proj1.min > proj2.min)){
              let mins = Math.abs(proj1.min - proj2.min);
              let maxs = Math.abs(proj1.max - proj2.max);
              if (mins < maxs){
                  overlap += mins;
              } else {
                  overlap += maxs;
                  axes[i] = axes[i].mult(-1);
              }
          }

        if (overlap < minOverlap || minOverlap === null){
            minOverlap = overlap;
            smallestAxis = axes[i];
            if (i<firstShapeAxes){
                vertexObj = o2;
                if(proj1.max > proj2.max){
                    smallestAxis = axes[i].mult(-1);
                }
            } else {
                vertexObj = o1;
                if(proj1.max < proj2.max){
                    smallestAxis = axes[i].mult(-1);
                }
            }
        }  
    };

    let contactVertex = projShapeOntoAxis(smallestAxis, vertexObj).collVertex;
    //smallestAxis.drawVec(contactVertex.x, contactVertex.y, minOverlap, "blue");

    if(vertexObj === o2){
        smallestAxis = smallestAxis.mult(-1);
    }

    return {
        pen: minOverlap,
        axis: smallestAxis,
        vertex: contactVertex
    }
}

//Helping functions for the SAT below
//returns the min and max projection values of a shape onto an axis
function projShapeOntoAxis(axis, obj){
    setBallVerticesAlongAxis(obj, axis);
    let min = Vector.dot(axis, obj.vertex[0]);
    let max = min;
    let collVertex = obj.vertex[0];
    for(let i=0; i<obj.vertex.length; i++){
        let p = Vector.dot(axis, obj.vertex[i]);
        if(p<min){
            min = p;
            collVertex = obj.vertex[i];
        } 
        if(p>max){
            max = p;
        }
    }
    return {
        min: min,
        max: max, 
        collVertex: collVertex
    }
}

//finds the projection axes for the two objects
function findAxes(o1, o2){
    let axes = [];
    if(o1 instanceof Circle && o2 instanceof Circle){
        axes.push(o2.pos.subtr(o1.pos).unit());
        return axes;
    }
    if(o1 instanceof Circle){
        axes.push(closestVertexToPoint(o2, o1.pos).subtr(o1.pos).unit());
    }
    if(o1 instanceof Line){
        axes.push(o1.dir.normal());
    }   
    if (o1 instanceof Rectangle){
        axes.push(o1.dir.normal());
        axes.push(o1.dir);
    }
    if (o1 instanceof Triangle){
        axes.push(o1.vertex[1].subtr(o1.vertex[0]).normal());
        axes.push(o1.vertex[2].subtr(o1.vertex[1]).normal());
        axes.push(o1.vertex[0].subtr(o1.vertex[2]).normal());
    }
    if (o2 instanceof Circle){
        axes.push(closestVertexToPoint(o1, o2.pos).subtr(o2.pos).unit());
    }
    if (o2 instanceof Line){
        axes.push(o2.dir.normal());
    }   
    if (o2 instanceof Rectangle){
        axes.push(o2.dir.normal());
        axes.push(o2.dir);
    }
    if (o2 instanceof Triangle){
        axes.push(o2.vertex[1].subtr(o2.vertex[0]).normal());
        axes.push(o2.vertex[2].subtr(o2.vertex[1]).normal());
        axes.push(o2.vertex[0].subtr(o2.vertex[2]).normal());
    }
    return axes;
}

//iterates through an objects vertices and returns the one that is the closest to the given point
function closestVertexToPoint(obj, p){
    let closestVertex;
    let minDist = null;
    for(let i=0; i<obj.vertex.length; i++){
        if(p.subtr(obj.vertex[i]).mag() < minDist || minDist === null){
            closestVertex = obj.vertex[i];
            minDist = p.subtr(obj.vertex[i]).mag();
        }
    }
    return closestVertex;
}

//returns the number of the axes that belong to an object
function getShapeAxes(obj){
    if(obj instanceof Circle || obj instanceof Line){
        return 1;
    }
    if(obj instanceof Rectangle){
        return 2;
    }
    if(obj instanceof Triangle){
        return 3;
    }
}

//the ball vertices always need to be recalculated based on the current projection axis direction
function setBallVerticesAlongAxis(obj, axis){
    if(obj instanceof Circle){
        obj.vertex[0] = obj.pos.add(axis.unit().mult(-obj.r));
        obj.vertex[1] = obj.pos.add(axis.unit().mult(obj.r));
    }
}
//Thats it for the SAT and its support functions

//Prevents objects to float away from the canvas
function putWallsAroundCanvas(){
    let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
    let edge2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
    let edge3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
    let edge4 = new Wall(0, canvas.clientHeight, 0, 0);
}

//Game loop (60 frames per second)
function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    userInput();
    COLLISIONS.length = 0;
    
    BODIES.forEach((b) => {
        b.draw();
        b.display();
        if(b.player){
            b.keyControl();
        };
        b.reposition();
    })
    
    BODIES.forEach((b, index) => {
        for(let bodyPair = index+1; bodyPair < BODIES.length; bodyPair++){
            let bestSat = {
                pen: null,
                axis: null,
                vertex: null
            }
            for(let o1comp=0; o1comp<BODIES[index].comp.length; o1comp++){
                for(let o2comp=0; o2comp<BODIES[bodyPair].comp.length; o2comp++){
                    if(sat(BODIES[index].comp[o1comp], BODIES[bodyPair].comp[o2comp]).pen > bestSat.pen){
                        bestSat = sat(BODIES[index].comp[o1comp], BODIES[bodyPair].comp[o2comp]);
                        ctx.fillText("COLLISION", 500, 400);
                    }
                }
            }

            if(bestSat.pen !== null){
                COLLISIONS.push(new CollData(BODIES[index], BODIES[bodyPair], bestSat.axis, bestSat.pen, bestSat.vertex));
           }
        }
    });

    COLLISIONS.forEach((c) => {
        c.penRes();
        c.collRes();
    });

    requestAnimationFrame(mainLoop);
}

//Setting up the initial environment before starting the main loop
putWallsAroundCanvas();

//Creating 10 body object with random arguments
for(let addBody = 0; addBody < 10; addBody++){
    let x0 = randInt(100, canvas.clientWidth-100);
    let y0 = randInt(100, canvas.clientHeight-100);
    let x1 = x0 + randInt(-50, 50);
    let y1 = y0 + randInt(-50, 50);
    let r = randInt(10, 30);
    let m = randInt(0, 10);
    if(addBody%4 === 0){
        let ballObj = new Ball(x0, y0, r, m);
    }
    if(addBody%4 === 1){
        let boxObj = new Box(x0, y0, x1, y1, r, m);
    }
    if(addBody%4 === 2){
        let capsObj = new Capsule(x0, y0, x1, y1, r, m);
    }
    if(addBody%4 === 3){
        let starObj = new Star(x0, y0, r+20, m);
    }
};

let playerBall = new Ball(320, 240, 10, 5);
playerBall.player = true;

requestAnimationFrame(mainLoop);