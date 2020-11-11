let canvas = document.querySelector("canvas");

canvas.width = 800;
canvas.height = 600;

let g = canvas.getContext("2d")

const ACCELERATION = 1
const FRICTION = -0.05 //-0.05
const GRAVITY = 0.9

const CAMERAACCELERATION = 1
const CAMERAFRICTION = -0.1

let mouseHeld = false;
let mousePos = {
    x: 0,
    y: 0
}

let drawingRect = {
    w: 0,
    h: 0,
    pos: {
        x: 0,
        y: 0
    }
}


function getCollisionAngle(objectA, objectB) {
    
    let posA = {
        x: objectA.pos.x + objectA.w/2,
        y: objectA.pos.y + objectA.h/2,
    }
    let posB = {
        x: objectB.pos.x + objectB.w/2,
        y: objectB.pos.y + objectB.h/2,
    }

    let distX = posA.x-posB.x
    let distY = posA.y-posB.y

    let collisionAngle = Math.atan2(distY, distX)*(180/Math.PI)
    if(collisionAngle < 0) {
        collisionAngle+=360
    }
    collisionAngle = Math.round(collisionAngle)

    let bottomLeftAngle = Math.atan2(objectB.h/2, -objectB.w/2)*(180/Math.PI)
    let bottomRightAngle = Math.atan2(objectB.h/2, objectB.w/2)*(180/Math.PI)
    let topLeftAngle = Math.atan2(-objectB.h/2, -objectB.w/2)*(180/Math.PI)
    let topRightAngle = Math.atan2(-objectB.h/2, objectB.w/2)*(180/Math.PI)
    
    if(bottomLeftAngle < 0) {
        bottomLeftAngle+=360
    }
    if(bottomRightAngle < 0) {
        bottomRightAngle+=360
    }
    if(topLeftAngle < 0) {
        topLeftAngle+=360
    }
    if(topRightAngle < 0) {
        topRightAngle+=360
    }


    if(collisionAngle >= bottomRightAngle && collisionAngle <= bottomLeftAngle) {
        return "down"
    } else if(collisionAngle <= topRightAngle && collisionAngle >= topLeftAngle) {
        return "up"
    } else if(collisionAngle > bottomLeftAngle && collisionAngle < topLeftAngle) {
        return "left"
    } else if(collisionAngle > topRightAngle || collisionAngle < bottomRightAngle) {
        return "right"
    }

}


function Camera() {

    this.pos = {
        x: 0,
        y: 0
    }
    this.w = canvas.width
    this.h = canvas.height
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.input = {
        left: false,
        right: false,
        up: false,
        down: false
    }

    this.update = function() {
        this.acc.x = 0; this.acc.y = 0;

        this.input = {
            left: false,
            right: false,
            up: false,
            down: false
        }

        //tracks player
        let playerCenterPos = {
            x: player.pos.x+player.w/2,
            y: player.pos.y+player.h/2
        }
        let centerPos = {
            x: this.pos.x+this.w/2,
            y: this.pos.y+this.h/2
        }
        if(playerCenterPos.x-40 > centerPos.x) {
            this.input.right = true
        } else if(playerCenterPos.x+40 < centerPos.x) {
            this.input.left = true
        } 
        if(playerCenterPos.y-40 > centerPos.y) {
            this.input.down = true
        } else if(playerCenterPos.y+40 < centerPos.y) {
            this.input.up = true
        }

        if(this.input.left) {
            this.acc.x = -CAMERAACCELERATION;
        }
        if(this.input.right) {
            this.acc.x = CAMERAACCELERATION;
        }
        if(this.input.up) {
            this.acc.y = -CAMERAACCELERATION;
        }
        if(this.input.down) {
            this.acc.y = CAMERAACCELERATION;
        }
        this.acc.x += this.vel.x * CAMERAFRICTION;    this.acc.y += this.vel.y * CAMERAFRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        g.translate(-this.vel.x, -this.vel.y)
    }

    this.draw = function() {
        //g.translate(-this.vel.x, -this.vel.y)
    }

}


function Platform(x, y, w, h) {

    this.w = w
    this.h = h
    this.pos = {
        x: x,
        y: y
    }

    this.update = function() {

    }

    this.draw = function() {
        g.fillStyle = "#555"
        g.fillRect(this.pos.x, this.pos.y, this.w, this.h)
    }
}


function Player(x, y) {

    this.pos = {
        x: x,
        y:y 
    }
    this.w = 40;
    this.h = 40;
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.input = {
        left: false,
        right: false
    }
    this.jumping = false;

    this.checkCollision = function(object) {

        let x = this.pos.x
        let y = this.pos.y
        let w = this.w
        let h = this.h

        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.h; 

        return x < bX+bW && x+w > bX && y < bY+bH && y+h > bY

    }

    this.setDirection = function(code, bool) {
        switch (code) {
            case 65:
                this.input.left = bool
                break;
            case 68:
                this.input.right = bool
                break;  
            default:
                break;
        }
    }

    this.jump = function() {
        this.jumping = true;
        this.vel.y = -20
    }

    this.update = function() {

        this.acc.x = 0; this.acc.y = GRAVITY;
        if(this.input.left) {
            this.acc.x = -ACCELERATION;
        }
        if(this.input.right) {
            this.acc.x = ACCELERATION;
        }
        this.acc.x += this.vel.x * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;
    }

    this.draw = function() {

        g.fillStyle = "red"
        g.fillRect(this.pos.x, this.pos.y, this.w, this.h)

    }

}


let camera = new Camera()
let player = new Player(300, 100)
let platforms = [
    new Platform(100, 500, canvas.width-200, 50),
]


window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);
function keyDownHandler(e) {

    let code = e.keyCode;

    player.setDirection(code, true);

    if(code == 32 && player.jumping == false) {
        player.jump()
    }

}

function keyUpHandler(e) {

    let code = e.keyCode

    player.setDirection(code, false)

}

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = {x: camera.pos.x+mouseX, y: camera.pos.y+mouseY}
    if(mouseHeld) {
        drawingRect.w = mousePos.x-drawingRect.pos.x
        drawingRect.h = mousePos.y-drawingRect.pos.y
    }
}

function mouseDownHandler(e) {
    mouseHeld = true
    drawingRect.pos.x = mousePos.x
    drawingRect.pos.y = mousePos.y
}

function mouseUpHandler(e) {
    mouseHeld = false
    if(Math.abs(drawingRect.w) > 5 && Math.abs(drawingRect.h) > 5) {
        if(drawingRect.w < 0) {
            drawingRect.pos.x+=drawingRect.w
            drawingRect.w*=-1
        }
        if(drawingRect.h < 0) {
            drawingRect.pos.y+=drawingRect.h
            drawingRect.h*=-1
        }
        platforms.push(new Platform(drawingRect.pos.x, drawingRect.pos.y, drawingRect.w, drawingRect.h))
    }
    drawingRect = {
        w: 0,
        h: 0,
        pos: {
            x: 0,
            y: 0
        }
    }
}


function updatePhysics() {
    camera.update()
    player.update();
    for(let platform of platforms) {
        platform.update()
    }

    //collision reaction
    for(let platform of platforms) {
        if(player.checkCollision(platform)) {
            let collisionAngle = getCollisionAngle(player, platform)
            if(collisionAngle === "up") {
                //player land on ground --> move to top of platform
                player.jumping = false
                player.vel.y = 0
                player.pos.y = platform.pos.y-player.h
            } else if(collisionAngle === "down") {
                //hit head of player and go back down
                player.vel.y *= -1
            //stops player when the hit a wall
            } else if(collisionAngle === "left") {
                player.jumping = false
                player.vel.x = 0
                player.pos.x = platform.pos.x-player.w
            } else if(collisionAngle === "right") {
                player.jumping = false
                player.vel.x = 0
                player.pos.x = platform.pos.x+platform.w
            }
        }
    }
}


function render() {
    
    g.clearRect(camera.pos.x-1000, camera.pos.y-1000, canvas.width+2000, canvas.height+2000)
    camera.draw()
    player.draw();
    for(let platform of platforms) {
        platform.draw()
    }

    //preview rectangle to draw
    g.fillStyle = "#777"
    g.fillRect(drawingRect.pos.x, drawingRect.pos.y, drawingRect.w, drawingRect.h)

    /*
    g.lineWidth = 5
    g.strokeStyle = "blue"
    g.beginPath()
    g.moveTo(100, 100)
    g.lineTo(100+Math.cos(45*(Math.PI/180))*100, 100+Math.sin(45*(Math.PI/180))*100)
    g.stroke()

    g.lineWidth = 5
    g.strokeStyle = "red"
    g.beginPath()
    g.moveTo(100, 100)
    g.lineTo(100+Math.cos(135*(Math.PI/180))*100, 100+Math.sin(135*(Math.PI/180))*100)
    g.stroke()

    g.lineWidth = 5
    g.strokeStyle = "green"
    g.beginPath()
    g.moveTo(100, 100)
    g.lineTo(100+Math.cos(225*(Math.PI/180))*100, 100+Math.sin(225*(Math.PI/180))*100)
    g.stroke()

    g.lineWidth = 5
    g.strokeStyle = "yellow"
    g.beginPath()
    g.moveTo(100, 100)
    g.lineTo(100+Math.cos(315*(Math.PI/180))*100, 100+Math.sin(315*(Math.PI/180))*100)
    g.stroke()
    */
}

//updates physics every 1/60th of a second no matter what (delta time)
setInterval( fixedUpdate = () => {
    updatePhysics()
}, (1/60)*1000)

//redering loop
function animate() {

    requestAnimationFrame(animate)

    
    render()

}

animate()