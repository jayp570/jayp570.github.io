let canvas = document.querySelector("canvas");

canvas.width = 800;
canvas.height = 600;

let ctx = canvas.getContext("2d")

const g = 10
const springLength = 20
const k = 10000

const dt = 0.1

let mouseHeld = false
let mousePos = new Vector2(0, 0)

let pointSize = 8

let paused = true
let displayPath = false
let displayFieldLines = true


function getDist(point1, point2) {
    return Math.sqrt((point2.pos.x-point1.pos.x)**2 + (point2.pos.y-point1.pos.y)**2)
}



function Point(x, y, charge, mass, fixed, id) {

    this.pos = new Vector2(x, y)
    this.vel = new Vector2(0, 0)
    this.acc = new Vector2(0, 0)
    this.forces = []
    this.mass = mass
    this.charge = charge

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

        if(displayPath && !paused) {
            this.renderPath()
        }

        if(this.fixed) {
            ctx.fillStyle = "black"
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, pointSize+2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = this.charge < 0 ? "blue" : "red"
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

    }

}



















let points = []
points.push(new Point(400, 300, 1, 1, false, 0))
points.push(new Point(300, 300, -1, 1, false, 1))
//points.push(new Point(200, 300, 1, 1, false, 2))

function togglePaths() {
    displayPath = !displayPath
}

function toggleFieldLines() {
    displayFieldLines = !displayFieldLines
}

function addPositiveCharge() {
    let id = points.length
    points.push(new Point(100, id*40, 1, 1, false, id))
}

function addNegativeCharge() {
    let id = points.length
    points.push(new Point(100, id*40, -1, 1, false, id))
}

window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);
window.addEventListener('keypress', keyPressHandler, false)

function keyPressHandler() {
    let code = event.keyCode
    if(code == 32) {
        paused = !paused
    }
}

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

    for(let point1 of points) {
        for(let point2 of points) {
            if(point1.id != point2.id) {
                let r = getDist(point1, point2)
                let coulombicForce = k*point1.charge*point2.charge/(r**2) //F_electric = K*q1*q2 / r^2
                let dx = point1.pos.x - point2.pos.x
                let dy = point1.pos.y - point2.pos.y
                let unitVector = new Vector2(dx/r, dy/r)
                coulombicForce = Vector2.multiply(unitVector, coulombicForce)
                point1.addForce(coulombicForce)
            }
        }
    }

    for(let point of points) {
        point.updatePosition()
        //console.log(point.pos.x)
    }

}












function renderFieldLines() {
    for(let originalPoint of points) {
        let originalPointSign = Math.sign(originalPoint.charge)
        if(originalPoint.charge == 1) {
            let lineNumber = parseInt(document.getElementById("lineNumberInput").value)*Math.abs(originalPoint.charge)
            let angleInterval = (2*Math.PI)/lineNumber
            for(let i = 0; i < lineNumber; i++) {
                let angle = angleInterval*i
                let endLine = false
                let tick = 0
                let testPos = new Vector2(originalPoint.pos.x+Math.cos(angle)*pointSize, originalPoint.pos.y+Math.sin(angle)*pointSize)
                ctx.strokeStyle = "black"
                ctx.beginPath()
                ctx.moveTo(testPos.x, testPos.y)
                while(!endLine) {
                    let fields = []
                    for(let point of points) {
                        let r = Vector2.getDist(testPos, point.pos)
                        let field = k*point.charge/(r**2) //F_electric = K*q1*q2 / r^2
                        //negative field lines go backwards, so they eventually end up at the same position as the point --> divide by 0 --> fucks up shit
                        let dx = testPos.x - point.pos.x
                        let dy = testPos.y - point.pos.y
                        let unitVector = new Vector2(dx/r, dy/r)
                        field = Vector2.multiply(unitVector, field)
                        fields.push(field)
                    }
                    let ENet = new Vector2(0, 0)
                    for(let E of fields) {
                        ENet = Vector2.add(ENet, E)
                    }
                    ENet = Vector2.divide(ENet, originalPointSign*ENet.getMagnitude())
                    ctx.lineTo(testPos.x+ENet.x, testPos.y+ENet.y)
                    testPos = Vector2.add(testPos, ENet)
                    //console.log(testPos)
                    //draw arrows
                    if(tick%200 == 0) {
                        ctx.lineTo(testPos.x-10*Math.cos(0.4+ENet.getAngle()), testPos.y-10*Math.sin(0.4+ENet.getAngle()))
                        ctx.moveTo(testPos.x, testPos.y)
                        ctx.lineTo(testPos.x-10*Math.cos(-0.4+ENet.getAngle()), testPos.y-10*Math.sin(-0.4+ENet.getAngle()))
                        ctx.moveTo(testPos.x, testPos.y)
                    }

                    tick++
                    for(let point of points) {
                        if(Vector2.getDist(point.pos, testPos) <= pointSize) {
                            ctx.stroke()
                            endLine = true
                            break
                        }
                    }
                    if(!endLine && tick > 10000) {
                        ctx.stroke()
                        endLine = true
                    }
                }
            }
        }
    }
}

function render() {
    if(displayFieldLines) {
        renderFieldLines()
    }
    for(let i = 0; i < points.length; i++) {
        points[i].render()
    }
    ctx.fillStyle = "black"
    ctx.fillText(`displayPath: ${displayPath}`, 10, 570)
    ctx.fillText(`displayFieldLines: ${displayFieldLines}`, 10, 580)
}

let frames = 0;
setInterval( fixedUpdate = () => {
    if(!paused) {
        updatePhysics()
        frames++
    }
}, (1/60)*1000)



function animate() {

    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    
    render()

}

animate()




//WATCH VIDEO  <br> https://www.youtube.com/watch?v=aVwxzDHniEw <br> https://www.youtube.com/watch?v=jvPPXbo87ds