let displayText = ""
let articleText = ""
let data
let articleName = vitalArticles[Math.floor(Math.random()*vitalArticles.length)]
//articleName = "pet door"
const commonWords = ["a","aboard","about","above","across","after","against","along","amid","among","an","and","around","as","at","because","before","behind","below","beneath","beside","between","beyond","but","by","concerning","considering","despite","down","during","except","following","for","from","if","in","inside","into","is","it","like","minus","near","next","of","off","on","onto","opposite","or","out","outside","over","past","per","plus","regarding","round","save","since","than","the","through","till","to","toward","under","underneath","unlike","until","up","upon","versus","via","was","with","within","without"]
let guesses = []
let guessCounts = {}
let articleWords

settingsPopup.style.display = "none"
victoryPopup.style.display = "none"
popupBackground.style.display = "none"

let won = false

let notCensored = [" ", ",", ".", "-", "(", ")", ";", ":", "'", "[", "]", "/"]

const http = new XMLHttpRequest()

http.open("GET", `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&titles=${articleName}&redirects=true&origin=*`)
http.send()

http.onload = () => {
    data = http.responseText
    data = JSON.parse(data)
    data = data.query.pages[Object.keys(data.query.pages)[0]]
    load()
}

function load() {
    console.log(data)
    console.log(data.extract)
    document.getElementById("article").innerHTML = `<h1>${data.title}</h1>`+data.extract
    articleText = document.getElementById("article").innerHTML

    document.getElementById("guesses").innerHTML = ""

    let inTag = false
    for(let i = 0; i < articleText.length; i++) {
        let char = articleText[i]
        if(char == "<") {
            inTag = true
        }

        if(!inTag && !notCensored.includes(char)) {
            displayText += "█"
        } else {
            displayText += char
        }

        if(char == ">") {
            inTag = false
        }
    }

    console.log(displayText)

    document.getElementById("article").innerHTML = displayText

    for(let commonWord of commonWords) {
        reveal(commonWord)
    }

    //reveal("2")
    //reveal("zone")
    //reveal("tourism")

}

window.addEventListener('keydown', keyDownHandler, false);
function keyDownHandler(e) {
    let code = e.keyCode;
    guessInput = document.getElementById("guessInput")
    if(code == 13 && guessInput == document.activeElement) {
        guessWord = guessInput.value
        guessCount = reveal(guessWord.trim())
        guessInput.value = ""

        if(guessCount != -1) {
            //add to guess list html
            let num = guesses.length-commonWords.length
            document.getElementById("guesses").innerHTML = `
            <div id="guess">
                <span id="guessWord">${num}. ${guessWord}</span>
                <span id="guessCount">${guessCount}</span>
            </div>
            ` + document.getElementById("guesses").innerHTML
        }
    }
}


function reveal(guess) {

    if(!guesses.includes(guess) && guess != "" && articleText != displayText) {
        console.log("did guess")
        guesses.push(guess)

        let count = 0

        let allRevealed = false
        let lastIndex = 0
        while(!allRevealed) {
            let newDisplayText = ""
            let index = articleText.toLowerCase().indexOf(guess.toLowerCase(), lastIndex)
            //console.log(index)
            if(displayText[index] == "█" && displayText[index-1] != "█" && displayText[index+guess.length] != "█") {
                // for(let i = 0; i < articleText.length; i++) {
                //     if(i >= index && i < index+guess.length) {
                //         newDisplayText += articleText[i]
                //     } else {
                //         newDisplayText += displayText[i]
                //     }
                // }
                newDisplayText = displayText.substring(0, index-1) + articleText.substring(index-1, index+guess.length) + displayText.substring(index+guess.length)
                //console.log(articleText.substring(index-5, index+guess.length+10))
                displayText = newDisplayText
                count++

            }
            //console.log(newDisplayText)
            document.getElementById("article").innerHTML = displayText

            lastIndex = index+1
            if(articleText.toLowerCase().indexOf(guess.toLowerCase(), lastIndex) == -1) {
                allRevealed = true
            }

        }

        let h1 = displayText.substring(0, displayText.indexOf("</h1>"))
        if(!h1.includes("█")) {
            won = true
            toggleVictoryPopup()
            displayText = articleText
            document.getElementById("article").innerHTML = displayText
        }
        guessCounts[guess] = count
        return count
    }

    return -1
}






function toggleSettingsPopup() {
    //FOR SOME REASON, THE SETTINGS POPUP TOGGLE ONLY WORKS THE SECOND TIME YOU CLICK IT, THE FIRST TIME THE DISPLAY CLAIMS TO BE UNDEFINED?!??!?!?
    //NEVERMIND I GOT IT^^^^ 
    let settingsPopup = document.getElementById("settingsPopup")
    let popupBackground = document.getElementById("popupBackground")
    console.log(settingsPopup.style.display)
    if(settingsPopup.style.display == "none") {
        settingsPopup.style.display = "block"
        popupBackground.style.display = "block"
    } else {
        settingsPopup.style.display = "none"
        popupBackground.style.display = "none"
    }
}

function toggleVictoryPopup() {
    let victoryPopup = document.getElementById("victoryPopup")
    let popupBackground = document.getElementById("popupBackground")
    console.log(victoryPopup.style.display)
    if(victoryPopup.style.display == "none") {
        victoryPopup.style.display = "block"
        popupBackground.style.display = "block"
    } else {
        victoryPopup.style.display = "none"
        popupBackground.style.display = "none"
    }
}

function giveUp() {
    toggleSettingsPopup()
    displayText = articleText
    document.getElementById("article").innerHTML = displayText
}

function newGame() {
    displayText = ""
    articleText = ""
    data
    articleName = vitalArticles[Math.floor(Math.random()*vitalArticles.length)]
    //articleName = "pacific_ocean"
    guesses = []
    guessCounts = {}
    articleWords

    settingsPopup.style.display = "none"
    victoryPopup.style.display = "none"
    popupBackground.style.display = "none"

    won = false

    notCensored = [" ", ",", ".", "-", "(", ")", ";", ":", "'", "[", "]", "/"]

    const http = new XMLHttpRequest()

    http.open("GET", `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&titles=${articleName}&redirects=true&origin=*`)
    http.send()

    http.onload = () => {
        data = http.responseText
        data = JSON.parse(data)
        data = data.query.pages[Object.keys(data.query.pages)[0]]
        load()
    }
}

function share() {

}


function toggleTheme() {



}