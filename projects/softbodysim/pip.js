let canvas = document.querySelector("canvas");

canvas.width = 800;
canvas.height = 600;

let g = canvas.getContext("2d")

let mouseHeld = false;
let mousePos = {
    x: 0,
    y: 0
}

const ACCELERATION = 0.6
const FRICTION = -0.2


function randomInt(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1) + min)
    return num;
}

function randomNum(min, max) {
    return Math.random() * (max - min) + min
}

const pointsNum = 7

let points = []

let angles = []
for(let i = 0; i < pointsNum; i++) {
    angles.push(randomNum(0, 2*Math.PI))
}
angles.sort((a, b) => a-b)

for(let i = 0; i < pointsNum; i++) {
    let r = randomInt(25, 150)
    points.push({
        x: (r*Math.cos(angles[i]))+(canvas.width/2),
        y: (r*Math.sin(angles[i]))+(canvas.height/2)
    })
}
points.push(points[0])
console.log(points)



class Player {

    constructor() {
        this.pos = {x: 100, y: 100}
        this.vel = {x: 0, y: 0}
        this.acc = {x: 0, y: 0}
        this.size = 40
        this.input = {left: false, right: false, up: false, down: false}
    }

    update() {
        this.acc.x = 0
        this.acc.y = 0
        if(this.input.left) {
            this.acc.x = -ACCELERATION
        }
        if(this.input.right) {
            this.acc.x = ACCELERATION
        }
        if(this.input.up) {
            this.acc.y = -ACCELERATION
        }
        if(this.input.down) {
            this.acc.y = ACCELERATION
        }
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;
    }

    setDirection(code, bool) {
        if(code == 87) {
            this.input.up = bool
        } else if(code == 83) {
            this.input.down = bool
        } else if(code == 65) {
            this.input.left = bool
        } else if(code == 68) {
            this.input.right = bool
        }
    }

    draw() {
        //g.fillStyle = "red"
        g.fillRect(this.pos.x, this.pos.y, this.size, this.size)
    }

    checkCollision() {
        let vertices = [
            {x: this.pos.x, y: this.pos.y},
            {x: this.pos.x+this.size, y: this.pos.y},
            {x: this.pos.x+this.size, y: this.pos.y+this.size},
            {x: this.pos.x, y: this.pos.y+this.size},
            {x: this.pos.x, y: this.pos.y}
        ]
        for(let vertex of vertices) {
            if(pip(points, vertex)) {
                return true
            }
        }
        for(let point of points) {
            if(pip(vertices, point)) {
                return true
            }
        }
        return false

    }

}


let player = new Player()


window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);
window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = {x: mouseX, y: mouseY}
}

function mouseDownHandler(e) {
    mouseHeld = true
}

function mouseUpHandler(e) {
    mouseHeld = false
}

function keyDownHandler(e) {
    let code = e.keyCode;
    player.setDirection(code, true);
    // if(code == 32 && player.jumping == false) {
    //     player.jump()
    // }
}

function keyUpHandler(e) {
    let code = e.keyCode
    player.setDirection(code, false)
}

function ccw(a, b, c) {
    return (c.y-a.y)*(b.x-a.x) > (b.y-a.y)*(c.x-a.x)
}

function pip(points, d) {
    let intersections = 0
    for(let i = 0; i < points.length-1; i++) {
        let a = points[i]
        let b = points[i+1]
        let c = {x: 0, y: 0}
        //let d = d
        if(ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d)) {
            intersections++
        }
    }
    if(intersections%2 == 1) {
        return true
    }
    return false
}






//redering loop
function animate() {

    requestAnimationFrame(animate)

    player.update()


    g.fillStyle = "black"
    g.fillRect(0, 0, canvas.width, canvas.height)

    g.fillStyle = "white"
    for(let i = 0; i < points.length; i++) {
        g.beginPath();
        //g.fillText(i+"", points[i].x+4, points[i].y+4)
        g.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
        g.fill()
    }
    g.strokeStyle = "white"
    for(let i = 0; i < points.length-1; i++) {
        g.beginPath();
        g.moveTo(points[i].x, points[i].y);
        g.lineTo(points[i+1].x, points[i+1].y)
        g.stroke()
    }

    if(pip(points, mousePos)) {
        g.fillStyle = "red"
    } else {
        g.fillStyle = "limegreen"
    }
    g.beginPath();
    g.arc(mousePos.x, mousePos.y, 4, 0, 2 * Math.PI);
    g.fill()

    if(player.checkCollision()) {
        g.fillStyle = "blue"
    } else {
        g.fillStyle = "red"
    }
    player.draw()

}

animate()