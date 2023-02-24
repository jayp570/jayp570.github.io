let canvas = document.querySelector("canvas");

canvas.width = 800
canvas.height = 600


let ctx = canvas.getContext("2d")

let mouseHeld = false;
let mousePos = {x: 0, y: 0}

const COLORS = {0: "red", 1: "cyan", 2: "orange", 3: "green", 4: "magenta", 5: "lime", 6: "yellow"}
let pointSize = 5

function getDist(p1, p2) {
    return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2)
}


function Point(x, y, color) {

    this.x = x; this.y = y;
    this.selected = false
    this.color = color

    this.render = function() {
        if(this.color != "") {
            ctx.fillStyle = this.color
            ctx.beginPath();
            ctx.arc(this.x, this.y, pointSize, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }
}


let points = [
    new Point(300, 400, ""),
    new Point(300, 300, ""),
    new Point(500, 300, ""),
    new Point(500, 400, "")
]
for(let i = 0; i < points.length; i++) {
    points[i].color = COLORS[i]
}

function lerp(p1, p2, t) {
    let x = (1-t)*p1.x + t*p2.x
    let y = (1-t)*p1.y + t*p2.y
    return new Point(x, y, "")
}

let curve = []

//reduce a set of points length n to points length n-1 for any given t
function reduce(points, t) {
    //console.log(points)
    if(points.length == 1) {
        return points[0]
    }
    let out = []
    for(let i = 0; i < points.length-1; i++) {
        out.push(lerp(points[i], points[i+1], t))
    }
    return reduce(out, t)
}

//make curve for t from 0 to 1
function bezierCurve() {
    curve = []
    for(let t = 0; t < 1; t+=0.01) {
        curve.push(reduce(points, t))
    }
}

bezierCurve()




function addPoint() {
    let randomX = (Math.random()*50)
    let randomY = (Math.random()*100)-50
    points.push(new Point(points[points.length-1].x+randomX, points[points.length-1].y+randomY, COLORS[points.length]))
    bezierCurve()
}

function removePoint() {
    if(points.length > 1) {
        points.pop()
        bezierCurve()
    }
}

window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener("mouseup", mouseUpHandler, false);
window.addEventListener("mousemove", mouseMoveHandler, false)
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mouseHeld = true;

    for(let point of points) {
        if(getDist(point, mousePos) <= pointSize*2) {
            point.selected = true
            break
        }
    }
}
function mouseUpHandler() {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mouseHeld = false;

    for(let point of points) {
        point.selected = false
    }
}
function mouseMoveHandler() {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    mousePos = {x: mouseX, y: mouseY}

    if(mouseHeld) {
        for(let point of points) {
            if(point.selected) {
                point.x = mousePos.x
                point.y = mousePos.y
                bezierCurve()
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for(let i = 0; i < curve.length-1; i++) {
        ctx.strokeStyle = "white"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(curve[i].x, curve[i].y)
        ctx.lineTo(curve[i+1].x, curve[i+1].y)
        ctx.closePath()
        ctx.stroke()
    }


    for(let i = 0; i < points.length-1; i++) {
        ctx.lineWidth = 0.5
        ctx.strokeStyle = "white"
        ctx.beginPath()
        ctx.moveTo(points[i].x, points[i].y)
        ctx.lineTo(points[i+1].x, points[i+1].y)
        ctx.closePath()
        ctx.stroke()
    }
    for(let i = 0; i < points.length; i++) {
        points[i].render()
    }
    
}

animate()

/*
make the population map with midpoint displacement
*/