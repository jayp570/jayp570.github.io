let canvas = document.querySelector("canvas");

canvas.width = 600;
canvas.height = 600;

let g = canvas.getContext("2d");


let mouseHeld = false
let mouseClickPos = {x: 0, y: 0}
let mousePos = {x: 0, y: 0}

let timer = 0

let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-"

let gridSize = 3

let tileSize = canvas.width/gridSize

let won = false
let gameStarted = false

let tileColors = {}
for(let i = 0; i < letters.length; i++)  {
    tileColors[letters[i]] = `hsl(${0+(300/Math.pow(gridSize, 2))*i},75%,50%)`
}

let checkCollision = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1+w1 > x2 && x1 < x2+w2 && y1+h1 > y2 && y1 < y2+h2
}


function Arrow(x, y, direction) {

    this.direction = direction
    this.pos = {x: x, y: y}
    this.opacity = 1.5
    this.size = 40

    this.drawTriangle = function(x1, y1, x2, y2, x3, y3) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.lineTo(x3, y3);
        g.fill();
    }

    this.draw = function() {
        g.fillStyle = "white"
        g.globalAlpha = this.opacity
        if(this.direction == "left") {
            this.drawTriangle(this.pos.x, this.pos.y-this.size, this.pos.x, this.pos.y+this.size, this.pos.x-this.size, this.pos.y)
        } else if(this.direction == "right") {
            this.drawTriangle(this.pos.x, this.pos.y-this.size, this.pos.x, this.pos.y+this.size, this.pos.x+this.size, this.pos.y)
        } else if(this.direction == "up") {
            this.drawTriangle(this.pos.x-this.size, this.pos.y, this.pos.x+this.size, this.pos.y, this.pos.x, this.pos.y-this.size)
        } else if(this.direction == "down") {
            this.drawTriangle(this.pos.x-this.size, this.pos.y, this.pos.x+this.size, this.pos.y, this.pos.x, this.pos.y+this.size)
        }
        g.globalAlpha = 1.0
        this.opacity -= 0.1
        if(this.opacity < 0) {
            this.opacity = 0
        }
    }

}


function Grid() {

    this.pos = {x: 0, y: 0}

    this.tiles = []
    for(let i = 0; i < gridSize; i++)   {
        this.tiles.push([])
        for(let j = 0; j < gridSize; j++) {
            this.tiles[i].push(letters[j+(i*gridSize)])
        }
    }

    this.drawTile = function(x, y, color, letter)  {
        g.fillStyle = color
        g.fillRect(x, y, tileSize, tileSize)
        g.fillStyle = "white"
        g.font = "bold 50px arial"
        g.textAlign = "center"
        g.fillText(letter, x+tileSize/2, 15+y+tileSize/2)
    }

    this.draw = function()  {
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                this.drawTile(j*tileSize, i*tileSize, tileColors[this.tiles[i][j]], this.tiles[i][j])
            }
        }
    }

    this.getLetterIndex = function(letter) {
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                if(this.tiles[i][j] == letter) {
                    return {row: i, col: j}
                }
            }
        }
    }

    this.shiftRow = function(col, rowChange) {

        let direction = 1
        if(rowChange > 0) {
            direction = -1
        }

        for(let i = (direction < 0 ? gridSize-1 : 0); (direction < 0 ? i > 0 : i < gridSize-1); i+= (direction < 0 ? -1 : 1)) {
            let temp1 = this.tiles[i][col]
            let temp2 = this.tiles[i+direction][col]
            this.tiles[i+direction][col] = temp1
            this.tiles[i][col] = temp2
        }

        mouseClickPos = mousePos
        arrows.push(new Arrow(mouseClickPos.x, mouseClickPos.y, (direction < 0 ? "down" : "up")))
        this.checkWin()
    }

    this.shiftColumn = function(row, colChange) {

        let direction = 1
        if(colChange > 0) {
            direction = -1
        }

        for(let i = (direction < 0 ? gridSize-1 : 0); (direction < 0 ? i > 0 : i < gridSize-1); i+= (direction < 0 ? -1 : 1)) {
            let temp1 = this.tiles[row][i]
            let temp2 = this.tiles[row][i+direction]
            this.tiles[row][i+direction] = temp1
            this.tiles[row][i] = temp2
        }

        mouseClickPos = mousePos
        arrows.push(new Arrow(mouseClickPos.x, mouseClickPos.y, (direction < 0 ? "right" : "left")))
        this.checkWin()
    }

    this.checkWin = function() {
        let tileString = ""
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                tileString += this.tiles[i][j]
            }
        }
        if(letters.indexOf(tileString) != -1) {
            won = true
            gameStarted = false
        }
    }

}


let grid = new Grid()

let scramble = function() {
    for(let i = 0; i < gridSize*10; i++) {
        let chance = Math.round(Math.random())
        let num = Math.floor(Math.random()*((gridSize-1)-0+1)+0)
        let change = Math.floor(Math.random()*(1+1+1)-1) 
        console.log(`Row/Col: ${num}, Change: ${change}`)
        chance > 0 ? grid.shiftColumn(num, change) : grid.shiftRow(num, change)
    }
    gameStarted = true
    won = false
    timer = 0
}


window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);

let arrows = []

function mouseDownHandler() {

    mouseHeld = true

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    mouseClickPos = {x: mouseX, y: mouseY}

}

function mouseMoveHandler() {

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    mousePos = {x: mouseX, y: mouseY}

    if(mouseHeld) {

        let mouseClickTileCoords = null
        for(let i = 0; i < grid.tiles.length; i++) {
            for(let j = 0; j < grid.tiles[i].length; j++) {
                if(checkCollision(mouseClickPos.x, mouseClickPos.y, 1, 1, j*tileSize, i*tileSize, tileSize, tileSize)) {
                    mouseClickTileCoords = {row: i, col: j}
                    break;
                }
            }
        }

        let mouseMoveTileCoords = null
        for(let i = 0; i < grid.tiles.length; i++) {
            for(let j = 0; j < grid.tiles[i].length; j++) {
                if(checkCollision(mousePos.x, mousePos.y, 1, 1, j*tileSize, i*tileSize, tileSize, tileSize)) {
                    mouseMoveTileCoords = {row: i, col: j}
                    break;
                }
            }
        }

        let mouseClickTile = grid.tiles[mouseClickTileCoords.row][mouseClickTileCoords.col]
        let mouseMoveTile = grid.tiles[mouseMoveTileCoords.row][mouseMoveTileCoords.col]

        let rowChange = mouseMoveTileCoords.row - mouseClickTileCoords.row
        let colChange = mouseMoveTileCoords.col - mouseClickTileCoords.col

        console.log(`${mouseClickTile} to ${mouseMoveTile}, Row Change: ${rowChange}, Col Change: ${colChange}`)

        if(gameStarted) {
            if(rowChange != 0) {
                grid.shiftRow(mouseMoveTileCoords.col, rowChange)
            } else if(colChange != 0) {
                grid.shiftColumn(mouseMoveTileCoords.row, colChange)
            }
        }
    }

}

function mouseUpHandler() {

    mouseHeld = false

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

}

setInterval(function() {
    if(gameStarted) {
        timer++
        let minutes = Math.floor(timer/60)
        let seconds = timer%60
        if(seconds < 10) {
            seconds = "0"+seconds
        }
        document.getElementById("timer").innerHTML = `${minutes}:${seconds}`
    }
}, 1000)

function animate() {

    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);

    grid.draw()

    for(let arrow of arrows) {
        arrow.draw()
    }

    if(won) {
        g.fillStyle = "black"
        g.globalAlpha = 0.5
        g.fillRect(0, 0, canvas.width, canvas.height)
        g.globalAlpha = 1.0
        g.textAlign = "center"
        g.fillStyle = "white"
        g.fillText("YOU WIN", canvas.width/2, canvas.height/2);
    }

}

animate();
