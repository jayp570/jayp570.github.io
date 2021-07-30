let canvas = document.querySelector("canvas");

canvas.width = 1000;
canvas.height = 600;

let g = canvas.getContext("2d");

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

readDimInput()

function readDatasetInput() {
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


function drawGraphAxes() {
    g.fillStyle = "#bbb"
    g.fillRect(GRAPHOFFSET, GRAPHOFFSET, 2, graphHeight)
    g.fillRect(GRAPHOFFSET, canvas.height-GRAPHOFFSET, graphWidth, 2)
}

function drawGraphBars() {
    g.fillStyle = "#308CFF"
    let count = 0
    for(let i = findMinArray(input); i <= findMaxArray(input); i++) {
        g.fillRect((xAxisScale*count)+GRAPHOFFSET+1, GRAPHOFFSET+graphHeight-(data[i]*yAxisScale), xAxisScale-2, data[i]*yAxisScale)
        count++
    }
}

function drawGraphXScale() {
    g.textAlign = "center"
    g.font = "13px helvetica"
    g.fillStyle = "black"
    let count = 0
    for(let i = findMinArray(input); i <= findMaxArray(input); i++) {
        g.fillText(i+"", (xAxisScale*count)+GRAPHOFFSET+(xAxisScale/2), graphHeight+GRAPHOFFSET+20)
        count++
    }
}

function drawGraphYScale() {
    g.textAlign = "right"
    g.font = "13px helvetica"
    g.fillStyle = "black"
    for(let i = 0; i <= yAxisMax; i+=10) {
        g.fillStyle = "black"
        g.fillText(i+"", GRAPHOFFSET-5, (graphHeight+GRAPHOFFSET)-(i*yAxisScale)+5)
        g.fillStyle = "#ddd"
        g.fillRect(GRAPHOFFSET, (graphHeight+GRAPHOFFSET)-(i*yAxisScale), graphWidth, 2)
    }
}

function findMode() {
    let mode = Object.keys(data)[0]
    for(let key of Object.keys(data)) {
        if(data[key] > data[mode]) {
            mode = key
        }
    }
    return mode
}

function findMean() {
    let mean = 0
    for(let num of input) {
        mean += num
    }
    mean /= input.length
    return mean
}

function findMedian() {
    let sortedInput = sortArray(input)
    return sortedInput[Math.floor(sortedInput.length/2)]
}

function findVariance() {
    let mean = findMean()
    let newList = JSON.parse(JSON.stringify(input))
    for(let i = 0; i < newList.length; i++) {
        newList[i] = newList[i]-mean
        newList[i] = Math.pow(newList[i], 2)
    }
    let variance = 0
    for(let item of newList) {
        variance += item
    }
    variance = variance/input.length
    return variance
}

function findSD() {
    let sd = findVariance()
    sd = Math.sqrt(sd)
    return sd
}

//displays central tendencies
function displayCT() {
    document.getElementById("ct").innerHTML = 
    `
    Range: ${range} <br>
    Mode: ${findMode()} <br>
    Mean: ${findMean()} <br>
    Median: ${findMedian()} <br>
    Variance: ${findVariance()} <br>
    Standard Deviation: ${findSD()}
    `
}

function drawGraph() {
    g.fillStyle = "white"
    g.fillRect(0, 0, canvas.width, canvas.height)
    drawGraphXScale()
    drawGraphYScale()
    drawGraphAxes()
    drawGraphBars()
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
        drawGraph()
        displayCT()
    }
}