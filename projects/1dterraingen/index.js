let canvas = document.querySelector("canvas");

canvas.width = 600;
canvas.height = 600;

let g = canvas.getContext("2d");

function getRandomNum(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1) + min)
    return num;
}

function getAverage(a, b) {
    return (a+b)/2
}

let terrain = [300, 300]

let maxIterations = 9

let maxDisplacement = 200
let smoothingRate = 2

let terrainCopy = JSON.parse(JSON.stringify(terrain))

function renderLines() {
    let xDimension = terrain.length
    for(let i = 0; i < terrain.length-1; i++) {
        let xPos1 = i*(canvas.width/(xDimension-1))
        let xPos2 = (i+1)*(canvas.width/(xDimension-1))
        g.lineWidth = 2
        g.beginPath();
        g.moveTo(xPos1, canvas.height-terrain[i])
        g.lineTo(xPos2, canvas.height-terrain[i+1])
        g.stroke()
    }
}

function renderDots() {
    let xDimension = terrain.length
    for(let i = 0; i < terrain.length; i++) {
        let xPos = i*(canvas.width/(xDimension-1))
        g.fillStyle = "red"
        g.globalAlpha = 0.5
        g.beginPath();
        g.arc(xPos, canvas.height-terrain[i], 3, 0, 2 * Math.PI);
        g.fill();
        g.globalAlpha = 1.0
    }
}

function iterate() {
    terrainCopy = JSON.parse(JSON.stringify(terrain))
    let valuesAdded = 0
    for(let i = 0; i < terrain.length-1; i++) {
        let displacement = getRandomNum(-1*maxDisplacement, maxDisplacement)
        terrainCopy.splice(i+1+valuesAdded, 0, getAverage(terrain[i], terrain[i+1])+displacement)
        valuesAdded++
    }

    maxDisplacement = maxDisplacement/smoothingRate
    terrain = JSON.parse(JSON.stringify(terrainCopy))
    console.log(terrain)
}

let iterations = 0
setInterval(function() {
    g.clearRect(0, 0, canvas.width, canvas.height)
    if(iterations < maxIterations) {
        iterate()
    }
    renderLines()
    if(iterations < maxIterations) {
        renderDots()
    }
    iterations++
}, 750) 

function reset() {
    iterations = 0
    terrain = [300, 300]
    maxDisplacement = parseFloat(document.getElementById("maxDisplacementInput").value)
    smoothingRate = parseFloat(document.getElementById("smoothingRateInput").value)
}


