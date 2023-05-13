let canvas = document.querySelector("canvas");

canvas.width = 900;
canvas.height = 600;

let ctx = canvas.getContext("2d")

const g = 10
let k = parseFloat(document.getElementById("kInput").value) //stiffness or spring constant
let R = parseFloat(document.getElementById("RInput").value) //drag coefficient * area * fluid density * 0.5

const dt = 0.1

let displayPath = false
let dragEnabled = true
let stretchColor = false

let mouseHeld = false
let mousePos = new Vector2(0, 0)

let pointSize = 3

let paused = false

let jelloMode = false

function getDist(point1, point2) {
    return Math.sqrt((point2.pos.x-point1.pos.x)**2 + (point2.pos.y-point1.pos.y)**2)
}

function closestPointToLine(a, b, p) {
    let ap = Vector2.subtract(p, a)
    let ab = Vector2.subtract(b, a)
    let abSquared = ab.getMagnitude()**2
    let apabDot = Vector2.dotProduct(ap, ab)
    let dist = apabDot/abSquared
    return Vector2.add(a, Vector2.multiply(ab, dist))
}

function randomNum(min, max) {
    return Math.random() * (max - min) + min
}

function randomInt(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1) + min)
    return num;
}




function Polygon(vertices) {

    this.vertices = vertices
    this.vertices.push(this.vertices[0])

    this.render = function() {
        ctx.fillStyle = "grey"
        ctx.strokeStyle = "grey"
        ctx.lineWidth = 5
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for(let i = 0; i < this.vertices.length-1; i++) {
            ctx.lineTo(this.vertices[i+1].x, this.vertices[i+1].y)
        }
        ctx.fill()
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
function toggleMesh() {
    jelloMode = !jelloMode
    body.mesh = jelloMode
    body.color = `hsl(${Math.random()*360}, 100%, 50%)`
}




function randomPolygon(initialX, initialY, verticesNum) {
    const pointsNum = verticesNum

    let points = []

    let angles = []
    let angle = 0
    let angleInterval = randomNum(0, Math.PI/2)
    for(let i = 0; i < pointsNum; i++) {
        angles.push(angle+angleInterval)
        angle += angleInterval
    }
    angles.sort((a, b) => a-b)

    for(let i = 0; i < pointsNum; i++) {
        let r = 100
        let x = r*Math.cos(angles[i])+initialX
        let y = r*Math.sin(angles[i])+initialY
        points.push(new Vector2(x, y))
    }
    return new Polygon(points)
}

function circle(initialX, initialY, size) {
    const pointsNum = 360
    let points = []
    let angles = []
    let angle = 0
    let angleInterval = 2*Math.PI/pointsNum
    for(let i = 0; i < pointsNum; i++) {
        angles.push(angle+angleInterval)
        angle += angleInterval
    }
    angles.sort((a, b) => a-b)
    for(let i = 0; i < pointsNum; i++) {
        let r = size
        let x = r*Math.cos(angles[i])+initialX
        let y = r*Math.sin(angles[i])+initialY
        points.push(new Vector2(x, y))
    }
    return new Polygon(points) 
}

function rectangle(initialX, initialY, width, height, angle) {
    let points = []
    points.push(new Vector2(initialX, initialY))
    points.push(new Vector2(initialX+Math.cos(angle)*width, initialY+Math.sin(angle)*width))
    initialX = points[points.length-1].x; initialY = points[points.length-1].y
    angle += Math.PI/2
    points.push(new Vector2(initialX+Math.cos(angle)*height, initialY+Math.sin(angle)*height))
    initialX = points[points.length-1].x; initialY = points[points.length-1].y
    angle += Math.PI/2
    points.push(new Vector2(initialX+Math.cos(angle)*width, initialY+Math.sin(angle)*width))
    for(let point of points) {point.x = Math.round(point.x); point.y = Math.round(point.y)}
    return new Polygon(points)
}

let body
/*
let polygons = [
    new Polygon([
        new Vector2(400, 500), 
        new Vector2(450, 500),
        new Vector2(450, 520),
        new Vector2(400, 520)
    ]),
    // new Polygon([
    //     new Vector2(300, 500), 
    //     new Vector2(700, 200),
    //     new Vector2(700, 350),
    //     new Vector2(300, 550)
    // ])
]
*/
let polygons = [circle(450, 420, 50), circle(750, 500, 50)]
polygons.push(rectangle(-80, 0, 100, canvas.height, 0))
polygons.push(rectangle(canvas.width-20, 0, 100, canvas.height, 0))
polygons.push(rectangle(0, canvas.height-20, canvas.width, 100, 0))
polygons.push(rectangle(0, 200, 250, 30, Math.PI/4))
polygons.push(rectangle(600, 300, 150, 30, 0))
polygons.push(rectangle(760, 200, 300, 30, -Math.PI/6))
console.log(polygons)
function restart(x, y) {
    if(x < canvas.width && y < canvas.height) {
        let width = parseInt(document.getElementById("bodyWidthInput").value)
        let height = parseInt(document.getElementById("bodyHeightInput").value)
        if(!Number.isNaN(width), !Number.isNaN(height)) {
            let dim = new Vector2(width, height)
            body = new SoftBodyMatrix(x-25*(dim.x-1)/2, y-25*(dim.y-1)/2, dim.x, dim.y, dim.x*dim.y, 25)
            //body = new SoftBodyPressure(x, y, 20, 20, 6)
        }
    }
}

restart(300, 100)


//check if lines intersect https://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
function ccw(a, b, c) {
    return (c.y-a.y)*(b.x-a.x) > (b.y-a.y)*(c.x-a.x)
}
//point in polygon collision detection
function pip(vertices, d) {
    let intersections = 0
    for(let i = 0; i < vertices.length-1; i++) {
        let a = vertices[i]
        let b = vertices[i+1]
        let c = {x: -1000, y: -1000}
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

function normalForce(polygon, point) {
    //find closest distance on outside of polygon to the point inside the polygon
    //clean up this whole weird object in object structure, it is disgusting
    let closestPoints = []
    for(let i = 0; i < polygon.vertices.length-1; i++) {
        let a = polygon.vertices[i]
        let b = polygon.vertices[i+1]
        let possibleClosest = closestPointToLine(a, b, point.pos)
        closestPoints.push({
            point: {pos: possibleClosest}, 
            distSquared: (point.pos.x-possibleClosest.x)**2+(point.pos.y-possibleClosest.y)**2}
        )
    }
    let closestPoint = closestPoints[0]
    for(let possibleClosest of closestPoints) {
        if(possibleClosest.distSquared < closestPoint.distSquared) {
            closestPoint = possibleClosest
        }
    }
    let dx = point.pos.x - closestPoint.point.pos.x
    let dy = point.pos.y - closestPoint.point.pos.y
    point.pos = closestPoint.point.pos //move the point to the outside of the polygon
    let dist = Math.sqrt(closestPoint.distSquared)
    //work out the math for normal force (magnitude will be -2mv), point must reflect off of surface
    //https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
    let n = new Vector2(dx/dist, dy/dist)
    let P0 = new Vector2(point.mass*point.vel.x, point.mass*point.vel.y)
    let J = Vector2.dotProduct(P0, n)
    J = new Vector2(J*dx/dist, J*dy/dist)
    J = Vector2.multiply(J, -2)
    return J
}

function updatePhysics() {

    //collisions between body and polygon
    for(let polygon of polygons) {
        for(let point of body.points.values()) {
            if(pip(polygon.vertices, point.pos)) {
                point.addForce(normalForce(polygon, point))
            }
        }
    }

    body.updatePhysics()
    body.updatePosition()
}

let time = 0;
setInterval( fixedUpdate = () => {
    if(!paused) {
        updatePhysics()
    }
    time+=dt
}, (1/60)*1000)







window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);
window.addEventListener('keypress', keyPressHandler, false)

function mouseDownHandler() {
    mouseHeld = true
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = new Vector2(mouseX, mouseY)
    restart(mousePos.x, mousePos.y)
}

function mouseMoveHandler() {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = new Vector2(mouseX, mouseY)
}

function mouseUpHandler() {
    mouseHeld = false
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = new Vector2(mouseX, mouseY)
}

function keyPressHandler() {
    code = event.keyCode
    console.log(code)
    if(code == 32) {
        paused = !paused
        //console.log("PAUSEDPAUSEDPAUSEDPAUSEDPAUSEDPAUSEDPAUSEDPAUSED")
    } else if(code == 97) {
        updatePhysics()
    }

    if(typeof(body.gasAmount != "undefined")) {
        if(code == 101) {
            body.gasAmount*=1.5
        } else if(code == 113) {
            body.gasAmount/=1.5
            body.gasAmount = body.gasAmount < 0 ? 0 : body.gasAmount
        }
    }
}


function render() {
    body.render()
    for(let polygon of polygons) {
        polygon.render()
    }
}

function animate() {

    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    
    render()

}

animate()