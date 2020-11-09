let canvas = document.querySelector("canvas");

canvas.width = 800;
canvas.height = 800;

let g = canvas.getContext("2d");

const TILESIZE = 50;

let lost = false
let win = false

let shiftHeld = false;

let cursorPos = {
    x: 0,
    y: 0
}

let seconds = 0

setInterval(changeTimer = () => {
    if(win == false && lost == false) {
        seconds++
    }
    let minutes = Math.floor(seconds/60)
    let secondsAfterMinutes = ""+seconds%60
    if(secondsAfterMinutes.length == 1) {
        secondsAfterMinutes = "0"+secondsAfterMinutes
    }
    document.getElementById("time").innerHTML = ""+`${minutes}:${secondsAfterMinutes}`
}, 1000)



class Tile {

    constructor(x, y) {
        this.pos = {x: x, y: y}
        this.w = TILESIZE
        this.h = TILESIZE
        this.type = 0
        this.covered = true
        this.flagged = false
    }

    checkCollision(x, y) {
        return (x > this.pos.x && x < this.pos.x+this.w && y > this.pos.y && y < this.pos.y+this.h)
    }

    draw() {
        if(this.covered) {
            g.fillStyle = "#999"
        } else {
            g.fillStyle = "#eee"
        }
        g.fillRect(this.pos.x, this.pos.y, this.w, this.h)
        if(!this.covered) {
            if(this.type == -1) {
                g.fillStyle = "red"
                g.beginPath();
                g.arc(this.pos.x+this.w/2, this.pos.y+this.h/2, 15, 0, 2*Math.PI, false);
                g.fill();
            } else if(this.type > 0) {
                g.fillStyle = "#333"
                g.font = "bold 30px arial"
                g.fillText(""+this.type, this.pos.x-8+this.w/2, this.pos.y+12+this.h/2)
            }
        } else {
            if(this.flagged) {
                g.fillStyle = "yellow"
                g.fillRect(this.pos.x+10, this.pos.y+10, this.w-20, this.h-20)
            }
        }
        g.strokeStyle = "white"
        g.strokeRect(this.pos.x, this.pos.y, this.w, this.h)
    }

}




class Grid {
    
    constructor() {
        this.pos = {x: 0, y: 0}
        this.tiles = []
        for(let i = 0; i < canvas.height/TILESIZE; i++) {
            this.tiles.push([])
            for(let j = 0; j < canvas.width/TILESIZE; j++) {
                this.tiles[i].push(new Tile(j*TILESIZE, i*TILESIZE))
            }
        }
        this.bombNum = 0
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                let chance = Math.random()
                if(chance < 0.1) {
                    this.tiles[i][j].type = -1
                    this.bombNum++;
                }
            }
        }
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                if(this.tiles[i][j].type == 0) {
                    let adjacentTiles = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
                    for(let coords of adjacentTiles) {
                        try {
                            if(this.tiles[i+coords[0]][j+coords[1]].type == -1) {
                                this.tiles[i][j].type++;
                            }
                        } catch (error) {   
                            
                        }
                    }
                }
            }
        }
    }

    draw() {
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].draw()
            }
        }
    }

    flood(row, col) {
        let adjacentTiles = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
        for(let coords of adjacentTiles) {
            try {
                if(this.tiles[col+coords[0]][row+coords[1]].covered == true && this.tiles[col+coords[0]][row+coords[1]].flagged == false) {
                    if(this.tiles[col+coords[0]][row+coords[1]].type == 0) {
                        this.tiles[col+coords[0]][row+coords[1]].covered = false
                        setTimeout(f => {this.flood(row+coords[1], col+coords[0])}, 30);
                    } else if(this.tiles[col+coords[0]][row+coords[1]].type > 0) {
                        this.tiles[col+coords[0]][row+coords[1]].covered = false
                    }
                }
            } catch (error) {   
                
            }
        }
    }

    uncoverAll() {
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].covered = false;
            }
        }
    }

    countLeft() {
        let num = 0
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                if(this.tiles[i][j].covered) {
                    num++
                }
            }
        }
        return num
    }

}



let grid = new Grid()

window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener("mousemove", mouseMoveHandler, false);
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    if(lost == false && win == false) {
        for(let i = 0; i < grid.tiles.length; i++) {
            for(let j = 0; j < grid.tiles[i].length; j++) {
                if(grid.tiles[i][j].checkCollision(mouseX, mouseY)) {
                    let tile = grid.tiles[i][j]
                    if(!shiftHeld) {
                        if(tile.flagged == false) {
                            tile.covered = false
                            if(tile.type == -1) {
                                lost = true;
                                grid.uncoverAll()
                            }else if(tile.type == 0) {
                                grid.flood(j, i)
                            }
                        }
                    } else {
                        if(tile.covered) {
                            tile.flagged = !tile.flagged
                        }
                        
                    }
                }
            }
        }
        if(grid.countLeft() == grid.bombNum) {
            win = true;
            grid.uncoverAll()
        }
    }
}

function keyDownHandler(e) {
    let code = event.keyCode
    if(code == 16) {
        shiftHeld = true
    }
}
function keyUpHandler(e) {
    let code = event.keyCode
    if(code == 16) {
        shiftHeld = false
    }
}
function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    cursorPos = {x: mouseX, y: mouseY}
}



function animate() {
    requestAnimationFrame(animate)
    g.clearRect(0, 0, canvas.width, canvas.height)

    grid.draw();

    if(shiftHeld) {
        g.fillStyle = "yellow"
        g.fillRect(cursorPos.x+10, cursorPos.y+10, 20, 20)
    }

    if(lost) {
        g.globalAlpha = 0.4
        g.fillStyle = "black"
        g.fillRect(0, 0, canvas.width, canvas.height)
        g.globalAlpha = 1.0
        g.fillStyle = "white"
        g.font = " 80px arial"
        g.fillText("You Lose", canvas.width/2-160, canvas.height/2)
    }else if(win) {
        g.globalAlpha = 0.4
        g.fillStyle = "black"
        g.fillRect(0, 0, canvas.width, canvas.height)
        g.globalAlpha = 1.0
        g.fillStyle = "white"
        g.font = " 80px arial"
        g.fillText("You Win", canvas.width/2-160, canvas.height/2)
    }
}

animate()