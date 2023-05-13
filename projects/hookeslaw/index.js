let canvas = document.querySelector("canvas");

canvas.width = 800;
canvas.height = 600;

let ctx = canvas.getContext("2d")

const g = 10
const springLength = 20
let k = parseFloat(document.getElementById("kInput").value) //stiffness or spring constant
let R = parseFloat(document.getElementById("RInput").value) //drag coefficient * area * fluid density * 0.5

const dt = 0.1

let displayPath = false
let dragEnabled = true
let stretchColor = false

let mouseHeld = false
let mousePos = new Vector2(0, 0)

let pointSize = 5

function getDist(point1, point2) {
    return Math.sqrt((point2.pos.x-point1.pos.x)**2 + (point2.pos.y-point1.pos.y)**2)
}



function Point(x, y, velX, velY, mass, fixed, id) {

    this.pos = new Vector2(x, y)
    this.vel = new Vector2(velX, velY)
    this.acc = new Vector2(0, 0)
    this.forces = []
    this.mass = mass

    this.id = id

    this.fixed = fixed

    this.path = []
    this.pathColor = `hsl(${Math.random()*360}, 100%, 50%)`

    this.selected = false

    this.addForce = function(force) {
        this.forces.push(force)
    }

    this.updatePosition = function() {

        //update forces
        let fNet = new Vector2(0, 0)
        for(let force of this.forces) {
            fNet = Vector2.add(fNet, force)
        }
        this.acc = Vector2.divide(fNet, this.mass)

        //update quantities
        if(!this.fixed && !this.selected) {
            this.vel = Vector2.add(this.vel, Vector2.multiply(this.acc, dt))
            this.pos = Vector2.add(this.pos, Vector2.multiply(this.vel, dt))
            this.acc = new Vector2(0, 0)
        }
        this.forces = [] //all forces are instantaneous

        if(frames%1 == 0) {
            this.path.push(JSON.parse(JSON.stringify(this.pos)))
        }
        
    }

    this.renderPath = function() {
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.strokeStyle = this.pathColor
        let pathTime = 500
        for(let i = this.path.length-1; i > (this.path.length-pathTime > 0 ? this.path.length-pathTime : 0); i--) {
            ctx.moveTo(this.path[i].x, this.path[i].y)
            ctx.lineTo(this.path[i-1].x, this.path[i-1].y)
        }
        ctx.stroke()
    }

    this.render = function() {

        if(displayPath) {
            this.renderPath()
        }

        ctx.fillStyle = this.fixed ? "blue" : "black"
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, pointSize, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        if(this.selected) {
            ctx.globalAlpha = 0.5
            ctx.fillStyle = "white"
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, pointSize, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1
        }
        ctx.fillStyle = this.fixed ? "blue" : "black"
        ctx.fillText(`pos: ${this.pos.x}, ${this.pos.y}`, 10, 10+this.id*10)

    }

}





function togglePaths() {
    displayPath = !displayPath
}
function toggleStretchColor() {
    stretchColor = !stretchColor
}
function toggleDrag() {
    dragEnabled = !dragEnabled
}
function changeMassNum(num) {
    if(num < 0) {
        points.pop()
    } else {
        let lastPoint = points[points.length-1]
        points.push(new Point(lastPoint.pos.x, lastPoint.pos.y+springLength, 0, 0, 1, false, points.length))
    }
}
function changeK() {
    let input = parseFloat(document.getElementById("kInput").value)
    if(!Number.isNaN(input)) {
        k = input
    }
}
function changeR() {
    let input = parseFloat(document.getElementById("RInput").value)
    if(!Number.isNaN(input)) {
        R = input
    }
}


let points = []
function restart() {
    points = []
    points.push(new Point(400, 100, 0, 0, 1, true, 0))

    for(let i = 1; i < 8; i++) {
        points.push(new Point(400, 100+i*springLength, 0, 0, 1, false, i))
    }

    //points[1].fixed = true
}

restart()

window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);

function mouseDownHandler() {
    mouseHeld = true
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = new Vector2(mouseX, mouseY)
    for(let point of points) {
        if(Vector2.getDist(point.pos, mousePos) <= pointSize*2) {
            point.selected = true
            break
        }
    }
}

function mouseMoveHandler() {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = new Vector2(mouseX, mouseY)
    if(mouseHeld) {
        for(let point of points) {
            if(point.selected) {
                point.pos = mousePos
            }
        }
    }
}

function mouseUpHandler() {
    mouseHeld = false
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = new Vector2(mouseX, mouseY)
    for(let point of points) {
        point.selected = false
    }
}

function updatePhysics() {
    for(let point of points) {
        point.addForce(new Vector2(0, point.mass*g)) //gravity

        let v = point.vel.getMagnitude()
        let dragForce = -1*R*v //drag equation: F_d = 0.5 * rho * C_d * A * v^2
        if(v != 0 && dragEnabled) {
            point.addForce(new Vector2(dragForce*(point.vel.x/v), dragForce*(point.vel.y/v)))
        }
    }
    //this loop adds spring force between a mass and the mass behind it
    for(let i = 1; i < points.length; i++) {
        let point1 = points[i]
        let point2 = points[i-1]

        let dist = getDist(point1, point2)
        let dx = point1.pos.x - point2.pos.x
        let dy = point1.pos.y - point2.pos.y
        let springForce = k * (springLength - dist) //hookes law: F_spring = -k * distance spring has stretched
        point1.addForce(new Vector2(springForce*(dx/dist), springForce*(dy/dist))) //try making the x component 0 here to get some cool motion (turn on path)
    }

    //this loop adds spring force between a mass and the mass ahead of it
    for(let i = 0; i < points.length-1; i++) {
        let point1 = points[i]
        let point2 = points[i+1]

        let dist = getDist(point1, point2)
        let dx = point1.pos.x - point2.pos.x
        let dy = point1.pos.y - point2.pos.y
        let springForce = k * (springLength - dist)//hookes law: F_spring = -k * distance spring has stretched
        point1.addForce(new Vector2(springForce*(dx/dist), springForce*(dy/dist))) //try making the x component 0 here to get some cool motion (turn on path)
    }

    for(let point of points) {
        point.updatePosition()
    }
}

function render() {
    for(let i = 0; i < points.length; i++) {
        if(i != points.length-1) {
            ctx.strokeStyle = stretchColor ? `rgb(${2.9*Math.abs(springLength-getDist(points[i], points[i+1]))}, 0, 0)` : "black"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(points[i].pos.x, points[i].pos.y)
            ctx.lineTo(points[i+1].pos.x, points[i+1].pos.y)
            ctx.closePath()
            ctx.stroke()
        }
        points[i].render()
    }
    ctx.fillText(`displayPath: ${displayPath}`, 10, 570)
    ctx.fillText(`dragEnabled: ${dragEnabled}`, 10, 580)
    ctx.fillText(`stretchColor: ${stretchColor}`, 10, 590)
}

let frames = 0;
setInterval( fixedUpdate = () => {
    updatePhysics()
    frames++
}, (1/60)*1000)



function animate() {

    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    
    render()

}

animate()