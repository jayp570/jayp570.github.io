let canvas = document.querySelector("canvas");

canvas.width = (window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth)-25;
canvas.height = (window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight)-125;

let g = canvas.getContext("2d")

let mouseHeld = false;
let mouseHeldTime = 0;
let mousePos = {x: 0, y: 0}
let mouseDownPos = {x: 0, y: 0}

let heldKeys = new Set()

let cameraPos = {x: 0, y: 0}
let cameraSpeed = 5

const bgTileSize = 250

let getDist = Jayant.getDist;

const gravConstant = 1

let showVectors = false
let showPaths = true

function getGravForce(m1, m2, r) {
    return gravConstant*((m1*m2)/(r**2))
}

class Body {

    constructor(x, y, mass, vel, color) {
        this.pos = {x: x, y: y}
        this.mass = mass
        this.size = Math.sqrt(mass)
        this.acc = new Vector2(0, 0)
        this.vel = vel
        this.color = color
        this.path = []
    }

    draw() {
        if(showPaths) {
            g.beginPath()
            g.lineWidth = 1
            g.strokeStyle = "lightgrey"
            let step = 3
            for(let i = this.path.length; i > this.path.length-300; i-=step) {
                try {
                    g.moveTo(this.path[i-step].x, this.path[i-step].y)
                    g.lineTo(this.path[i].x, this.path[i].y)
                } catch (error) {
                    
                }
            }
            g.stroke()
        }
        g.fillStyle = this.color
        g.strokeStyle = this.color
        g.beginPath()
        g.arc(this.pos.x, this.pos.y, this.size, 0, 2*Math.PI)
        g.fill()
        if(showVectors) {
            g.strokeStyle = "red"
            g.lineWidth = 1
            g.beginPath()
            g.moveTo(this.pos.x, this.pos.y)
            g.lineTo(this.pos.x+(this.acc.x*1000), this.pos.y+(this.acc.y*1000))
            g.stroke()
            g.strokeStyle = "limegreen"
            g.lineWidth = 1
            g.beginPath()
            g.moveTo(this.pos.x, this.pos.y)
            g.lineTo(this.pos.x+(this.vel.x*10), this.pos.y+(this.vel.y*10))
            g.stroke()
        }
    }

    updatePos() {
        this.path.push(JSON.parse(JSON.stringify(this.pos)))
        this.vel = Vector2.add(this.vel, this.acc)
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
        this.acc.x = 0
        this.acc.y = 0
    }

}


let bodies = []
bodies.push(new Body(canvas.width/2, canvas.height/2, 1000, new Vector2(0, 0), "black"))
// bodies.push(new Body(100, 150, 1000, new Vector2(-1, -1), "black"))
// bodies.push(new Body(300, 150, 1000, new Vector2(-1, 1), "black"))

function reset() {
    bodies = []
    bodies.push(new Body(canvas.width/2, canvas.height/2, 1000, new Vector2(0, 0), "black"))
    g.translate(cameraPos.x, cameraPos.y)
    cameraPos = {x: 0, y: 0}
}

function toggleVectors() {
    showVectors = !showVectors
}

function togglePaths() {
    showPaths = !showPaths
}

function changeCameraSpeed() {
    cameraSpeed = parseInt(document.getElementById("cameraSpeedSlider").value)
}



window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);
window.addEventListener("mousemove", mouseMoveHandler, false);
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    if(mouseY < canvas.height) {
        console.log("asjdhfjklasdf")
        mouseHeld = true
        mouseDownPos = {x: mouseX, y: mouseY}
    }
}
function mouseUpHandler() {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    if(mouseHeldTime == 0) {
        mouseHeldTime = 2
    }
    if(mouseHeld) {
        //spawn new body
        let body = new Body(mouseDownPos.x+cameraPos.x, mouseDownPos.y+cameraPos.y, mouseHeldTime**2, Vector2.divide(Vector2.subtract(mouseDownPos, mousePos), 20))
        bodies.push(body)
    }
    mouseHeld = false
    mouseHeldTime = 0
}
function keyDownHandler(e) {
    let code = event.keyCode
    heldKeys.add(code)
}
function keyUpHandler(e) {
    let code = event.keyCode
    heldKeys.delete(code)
}
function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = {x: mouseX, y: mouseY}
}



function render() {
    g.clearRect(cameraPos.x-bgTileSize, cameraPos.y-bgTileSize, canvas.width+(bgTileSize*2), canvas.height+(bgTileSize*2))

    if(!mouseHeld) {
        if(heldKeys.has(87)) {
            g.translate(0, heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed)
            cameraPos.y -= heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed
        } 
        if(heldKeys.has(83)) {
            g.translate(0, -(heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed))
            cameraPos.y += heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed
        }
        if(heldKeys.has(65)) {
            g.translate(heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed, 0)
            cameraPos.x -= heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed
        }
        if(heldKeys.has(68)) {
            g.translate(-(heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed), 0)
            cameraPos.x += heldKeys.has(16) ? cameraSpeed*2 : cameraSpeed
        }
    }

    //draw background
    let bgX = cameraPos.x
    let bgY = cameraPos.y
    for(let i = -30; i < 30; i++) {
        for(let j = -30; j < 30; j++) {
            g.strokeStyle = "grey"
            g.lineWidth = 1
            g.strokeRect(bgX+(bgTileSize*j)-(bgX%bgTileSize), bgY+(bgTileSize*i)-(bgY%bgTileSize), bgTileSize, bgTileSize)
        }
    }

    //draw bodies
    for(let body of bodies) {
        body.draw()
    }
    //draw spawning bodies
    if(mouseHeld) {
        g.beginPath()
        g.arc(mouseDownPos.x+cameraPos.x, mouseDownPos.y+cameraPos.y, mouseHeldTime, 0, 2*Math.PI)
        g.fill()
        g.strokeStyle = "grey"
        g.lineWidth = 3
        g.moveTo(mouseDownPos.x+cameraPos.x, mouseDownPos.y+cameraPos.y)
        g.lineTo(mousePos.x+cameraPos.x, mousePos.y+cameraPos.y)
        g.stroke()
    }
}

function updatePhysics() {

    for(let i = 0; i < bodies.length; i++) {
        for(let j = 0; j < bodies.length; j++) {
            let b1 = bodies[i]
            let b2 = bodies[j]
            if(i != j) {
                let distY = b1.pos.y-b2.pos.y
                let distX = b1.pos.x-b2.pos.x
                let r = getDist(b1.pos, b2.pos)
                let gravForce = getGravForce(b1.mass, b2.mass, r)
                let force = new Vector2(gravForce*(distX/r), gravForce*(distY/r))
                b2.acc = Vector2.add(b2.acc, Vector2.divide(force, b2.mass))
            }
        }
    } 
    //lol!!!! teh epicz code burply red giraffe eats biscuits at midnight

    //collision
    for(let i = 0; i < bodies.length; i++) {
        for(let j = 0; j < bodies.length; j++) {
            let b1 = bodies[i]
            let b2 = bodies[j]
            if(i != j) {
                let dist = getDist(b1.pos, b2.pos)
                if(b1.size+b2.size > dist) {
                    bodies.splice(i, 1)
                    if(i > j) {
                        i--
                    } else {
                        j--
                    }
                    bodies.splice(j, 1)
                    let distY = b1.pos.y-b2.pos.y
                    let distX = b1.pos.x-b2.pos.x
                    let totalMass = b1.mass+b2.mass
                    let barycenter = new Vector2(
                        b1.pos.x-(distX*(b2.mass/totalMass)),
                        b1.pos.y-(distY*(b2.mass/totalMass))
                    )
                    let totalMomentum = Vector2.add(Vector2.multiply(b1.vel, b1.mass), Vector2.multiply(b2.vel, b2.mass))
                    bodies.push(new Body(barycenter.x, barycenter.y, totalMass, Vector2.divide(totalMomentum, totalMass), "black"))
                }
            }
        }
    }
}



setInterval( fixedUpdate = () => {
    //updatePhysics()
    if(mouseHeld) {
        mouseHeldTime++
    }
    //camera movement
    // console.log(heldKeys)
    
    // console.log(cameraPos)
}, (1/60)*1000)

function animate() {
    requestAnimationFrame(animate)
    updatePhysics()
    render()
    for(let body of bodies) {
        body.updatePos()
    }
}

animate()