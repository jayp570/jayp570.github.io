function drawGraphAxes() {
    g.fillStyle = "#bbb"
    g.fillRect(GRAPHOFFSET, GRAPHOFFSET, 2, graphHeight)
    g.fillRect(GRAPHOFFSET, canvas.height-GRAPHOFFSET, graphWidth, 2)
}

function generateGraphBars() {
    let count = 0
    for(let i = findMinArray(input); i <= findMaxArray(input); i++) {
        bars.push(new Bar(
            (xAxisScale*count)+GRAPHOFFSET+1, 
            GRAPHOFFSET+graphHeight-(data[i]*yAxisScale), 
            xAxisScale-2, 
            data[i]*yAxisScale, 
            i, 
            data[i]
        ))
        count++
    }
}

function drawGraphBars() {
    for(let i = findMinArray(input); i <= findMaxArray(input); i++) {
        bars[i-findMinArray(input)].draw()
    }

}

function drawGraphXScale() {
    g.textAlign = "center"
    g.font = "13px helvetica"
    g.fillStyle = "black"
    let count = 0
    let interval = 1
    if(range > 40) {
        interval = Math.ceil(range/40)
    }
    for(let i = findMinArray(input); i <= findMaxArray(input); i+=interval) {
        g.fillText(i+"", (xAxisScale*(count*interval))+GRAPHOFFSET+(xAxisScale/2), graphHeight+GRAPHOFFSET+20)
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
    let mode = [Object.keys(data)[0]]
    for(let key of Object.keys(data)) {
        if(data[key] > data[mode]) {
            mode = key
        }
    }
    let modes = []
    for(let key of Object.keys(data)) {
        if(data[mode] == data[key]) {
            modes.push(key)
        }
    }
    modes = sortArray(modes)
    return modes
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
    let modeString = ""
    for(let num of findMode()) {
        modeString += num+", "
    }
    modeString = modeString.substring(0, modeString.length-2)
    document.getElementById("ct").innerHTML = 
    `
    Range: ${range} <br>
    Mode: ${modeString} <br>
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