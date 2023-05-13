//this is inspired by https://roadtolarissa.com/oracle/ (an implementation of hte aaronson oracle)

let canvas = document.querySelector("canvas");

canvas.width = 700;
canvas.height = 600;

let g = canvas.getContext("2d");


let inputs = []
let patternsFreq = {}

let guess = "a"
let guesses = []


function sublistString(list, num1, num2) {
    let str = ""
    for(let i = num1; i < num2; i++) {
        str += list[i]
    }
    return str
}

function getAccuracy() {
    let correct = 0
    for(let i = 0; i < inputs.length; i++) {
        if(inputs[i] == guesses[i]) {
            correct++
        }
    }
    return Math.floor((correct/inputs.length)*100*100)/100
}

document.addEventListener("keydown", keyDownHandler, false)

let displayPattern = ""

function keyDownHandler(e) {

    let code = event.keyCode

    g.fillStyle = "black"
    g.strokeStyle = "black"
    g.lineWidth = 3
    g.font = "Bold 25px Consolas"
    g.clearRect(0,0,canvas.width,canvas.height);

    g.textAlign = "center"
    g.fillText("Guess", 350, 275)
    g.textAlign = "left"
    if(guess == "a") {
        g.strokeStyle = "black"
        g.fillStyle = "black"
    } else {
        g.fillStyle = "black"
        g.fillRect(300, 285, 100, 100)
        g.fillStyle = "white"
    }
    g.lineWidth = 3
    g.font = "Bold 50px Consolas"
    g.strokeRect(300, 285, 100, 100)
    g.fillText(guess, 336, 350)
    
    g.fillStyle = "black"

    guesses.push(guess)
    if(code == 65) {
        inputs.push("a")
        console.log(`Guess: ${guess}, Actual: a`)
    } else if(code == 68) {
        inputs.push("d")
        console.log(`Guess: ${guess}, Actual: d`)
    }

    

    let pattern = ""
    if(inputs.length > 4) {
        pattern = sublistString(inputs, inputs.length-4, inputs.length)
        displayPattern = pattern
    }
    if(pattern.length >= 4) {
        if(typeof patternsFreq[pattern] == "undefined") {
            patternsFreq[pattern] = 1
        } else {
            patternsFreq[pattern]++
        }
        if(typeof patternsFreq[pattern.substring(1, pattern.length)+"a"] == "undefined") {
            patternsFreq[pattern.substring(1, pattern.length)+"a"] = 0
        }
        if(typeof patternsFreq[pattern.substring(1, pattern.length)+"d"] == "undefined") {
            patternsFreq[pattern.substring(1, pattern.length)+"d"] = 0
        }
        if(patternsFreq[pattern.substring(1, pattern.length)+"a"] > patternsFreq[pattern.substring(1, pattern.length)+"d"]) {
            guess = "a"
        } else {
            guess = "d"
        }
    }

    console.log(patternsFreq)

    console.log(`Accuracy: ${getAccuracy()}`)
    g.fillStyle = "black"
    g.textAlign = "center"
    g.fillText(`Accuracy: ${getAccuracy()}%`, 336, 475)
    g.textAlign = "left"

    for(let i = 0; i < displayPattern.length; i++) {
        if(displayPattern[i] == "a") {
            g.strokeStyle = "black"
            g.fillStyle = "black"
        } else {
            g.fillStyle = "black"
            g.fillRect(150+(i*100), 100, 100, 100)
        }
        if(i == 3) {
            g.strokeStyle = "red"
            g.lineWidth = 5
            g.font = "Bold 25px Consolas"
            g.textAlign = "center"
            g.fillStyle = "black"
            g.fillText("Actual", 200+(i*100), 90)
            g.textAlign = "left"
        }
        g.font = "Bold 50px Consolas"
        g.strokeRect(150+(i*100), 100, 100, 100)
        if(displayPattern[i] == "d") {
            g.fillStyle = "white"
        }
        g.fillText(displayPattern[i], 186+(i*100), 165)
    }

    
    
}

function animate() {

    requestAnimationFrame(animate);
    // g.clearRect(0,0,canvas.width,canvas.height);

    // for(let i = 1; i < displayPattern.length; i++) {
    //     g.strokeStyle = "black"
    //     g.lineWidth = 3
    //     g.strokeRect(100+(i*100), 100, 100, 100)
    //     g.fillStyle = "black"
    //     g.font = "Bold 50px Consolas"
    //     g.fillText(displayPattern[i], 136+(i*100), 165)
    // }

}

animate();