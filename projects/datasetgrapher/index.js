let canvas = document.querySelector("canvas");

canvas.width = 1000;
canvas.height = 600;

let g = canvas.getContext("2d");

let mouseTooltip = null

let mouseX = 0
let mouseY = 0

const GRAPHOFFSET = 40

let graphWidth = canvas.width-(GRAPHOFFSET*2)
let graphHeight = canvas.height-(GRAPHOFFSET*2)

let input = []
let data = {}
let range
let xAxisMax
let xAxisScale
let yAxisMax
let yAxisScale

let bars = []

readDimInput()

function readDatasetInput() {
    bars = []
    input = document.getElementById("datasetInput").value
    input = input.split(",")
    for(let i = 0; i < input.length; i++) {
        input[i] = parseFloat(input[i])
    }

    range = findMaxArray(input)-findMinArray(input)

    data = {}
    for(let i = findMinArray(input); i <= findMaxArray(input); i++) {
        data[i] = 0
    }
    for(let i = 0; i < input.length; i++) {
        data[input[i]]++
    }
    console.log(`Input: ${input}\nData: ${JSON.stringify(data)}\nRange: ${range}`)

    yAxisMax = ceilTo(findMaxObjectValue(data), 10)
    yAxisScale = graphHeight/yAxisMax

    xAxisScale = graphWidth/(range+1)
}

function readDimInput() {
    let widthInput = parseInt(document.getElementById("widthInput").value)
    let heightInput = parseInt(document.getElementById("heightInput").value)
    if(!isNaN(widthInput) && !isNaN(heightInput) && widthInput > 0 && heightInput > 0) {
        canvas.width = widthInput
        canvas.height = heightInput
        graphWidth = canvas.width-(GRAPHOFFSET*2)
        graphHeight = canvas.height-(GRAPHOFFSET*2)
    }
}

function display() {
    readDimInput()
    readDatasetInput()
    let hasNaN = false
    for(let item of input) {
        if(isNaN(item)) {
            hasNaN = true
        }
    }
    if(hasNaN) {
        document.getElementById("ct").innerHTML = "That is not a valid data set!"
    } else {
        generateGraphBars()
        drawGraph()
        displayCT()
    }
}





window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);

function mouseDownHandler() {

    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

}

function mouseMoveHandler(event) {

    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    //console.log(`${mouseX}, ${mouseY}`)


}

function mouseUpHandler(event) {

    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

}




function animate() {

    requestAnimationFrame(animate);
    g.clearRect(0, 0, canvas.width, canvas.height);

    drawGraph()

    if(mouseTooltip != null) {
        mouseTooltip.draw()
    }

    mouseTooltip = null
    for(let bar of bars) {
        bar.highlighted = false
    }
    for(let bar of bars) {
        if(bar.checkCollision(mouseX, mouseY)) {
            bar.highlighted = true
            mouseTooltip = new Tooltip(mouseX+10, mouseY+10, 120, 45, `Value: ${bar.value}\nFrequency: ${bar.frequency}`)
            break
        }
    }

}

animate();