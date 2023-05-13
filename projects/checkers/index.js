let canvas = document.querySelector("canvas");

canvas.width = 600;
canvas.height = canvas.width+40;

let g = canvas.getContext("2d");

const TILESIZE = canvas.width/8

const players = ["red", "black"]

let turns = 0

function isEqual(obj1, obj2) { 
    return JSON.stringify(obj1) == JSON.stringify(obj2)
}

function isInList(list, obj) {
    for(let item of list) {
        if(isEqual(obj, item)) {
            return true
        }
    }
    return false
}

function findMin(list) {
    let min = list[0]
    for(let i = 0; i < list.length; i++) {
        if(min > list[i]) {
            min = list[i]
        }
    }
    return min
}

function Piece(color) {

    this.king = false

    this.color = color
    
    this.draw = function(x, y) {
        g.fillStyle = this.color
        g.beginPath();
        g.arc(x, y, TILESIZE/3, 0, 2 * Math.PI);
        g.fill();
        if(this.king) {
            let crownX = x
            let crownY = y-5
            g.fillStyle = "yellow"
            g.beginPath();
            g.moveTo(crownX, crownY);
            g.lineTo(crownX+5, crownY+5);
            g.lineTo(crownX+10, crownY);
            g.lineTo(crownX+10, crownY+10);
            g.lineTo(crownX-10, crownY+10);
            g.lineTo(crownX-10, crownY);
            g.lineTo(crownX-5, crownY+5);
            g.lineTo(crownX, crownY);
            g.fill();
        }
    }

}

function Tile(x, y) {

    this.pos = {x: x, y: y}

    this.draw = function(color) {
        g.fillStyle = color
        g.fillRect(this.pos.x, this.pos.y, TILESIZE, TILESIZE)
    }

    this.checkClicked = function(mX, mY) {
        m = {x: mX, y: mY}
        p = this.pos
        size = TILESIZE
        return m.x > p.x && m.x < p.x+size && m.y > p.y && m.y < p.y+size
    }

}

function Grid() {

    this.pos = {x: 0, y: 0}

    this.selectedTileCoords = null

    this.legalMoves = null

    this.tiles = []
    for(let i = 0; i < 8; i++) {
        this.tiles.push([])
        for(let j = 0; j < 8; j++) {
            this.tiles[i].push(new Tile(j*TILESIZE, i*TILESIZE))
        }
    }

    this.pieces = []
    for(let i = 0; i < 8; i++) {
        this.pieces.push([])
        for(let j = 0; j < 8; j++) {
            this.pieces[i].push(null)
        }
    }

    this.setPieces = function() {
        for(let i = 0; i < this.tiles.length; i++) {
            if(i < 3 || i >= 5) {
                let color = i < 3 ? players[1] : players[0]
                for(let j = i%2 == 0 ? 0 : 1; j < this.tiles[i].length; j+=2) {
                    this.pieces[i][j] = new Piece(color)
                }
            }
        }
    }

    this.draw = function() {
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                g.fillStyle = "white"
                if((j+i)%2 == 1) {
                    g.fillStyle = "green"
                }
                g.fillRect(this.tiles[i][j].pos.x, this.tiles[i][j].pos.y, TILESIZE, TILESIZE)
            }
        }
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                if(this.pieces[i][j] != null) {
                    this.pieces[i][j].draw(this.getPosForSpace(i, j).x, this.getPosForSpace(i, j).y)
                }
            }
        }
        let colors = ["black", "white"]
        let letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
        for(let i = 0; i < letters.length; i++) {
            g.fillStyle = colors[i%2]
            g.font = "10pt Arial"
            g.fillText(letters[i], i*TILESIZE+15, 15);
        }
        for(let i = 0; i < letters.length; i++) {
            g.fillStyle = colors[i%2]
            g.font = "10pt Arial"
            g.fillText(1+i+"", 5, i*TILESIZE+20);
        }
    }

    this.drawOverlay = function() {
        if(this.selectedTileCoords != null) {
            let selectedTile = this.tiles[this.selectedTileCoords.row][this.selectedTileCoords.col]
            g.globalAlpha = 0.5
            g.fillStyle = "white"
            g.fillRect(selectedTile.pos.x-3, selectedTile.pos.y-3, TILESIZE+6, TILESIZE+6)
            g.globalAlpha = 1.0
        }
        if(this.legalMoves != null) {
            for(let move of this.legalMoves) {
                g.globalAlpha = 0.5
                g.fillStyle = "yellow"
                g.beginPath();
                g.arc(this.getPosForSpace(move.row, move.col).x, this.getPosForSpace(move.row, move.col).y, TILESIZE/3, 0, 2 * Math.PI);
                g.fill();
                g.globalAlpha = 1.0
            }
        }
    }

    this.getPosForSpace = function(row, col) {
        return {
            x: this.tiles[row][col].pos.x + TILESIZE/2,
            y: this.tiles[row][col].pos.y + TILESIZE/2
        }
    }

    this.getClickedCoords = function(mousePosX, mousePosY) {
        for(let i = 0; i < this.tiles.length; i++) {
            for(let j = 0; j < this.tiles[i].length; j++) {
                if(this.tiles[i][j].checkClicked(mousePosX, mousePosY)) {
                    return {row: i, col: j}
                }
            }
        }
        return null
    }

    this.getLegalMoves = function(row, col) {
        let legalMoves = []
        let selectedPiece = this.pieces[this.selectedTileCoords.row][this.selectedTileCoords.col]
        let spaces = []
        let canDestroy = false
        if(selectedPiece.color == "red") {
            spaces = [{row: row-1, col: col-1}, {row: row-1, col: col+1}]
            if(selectedPiece.king) {
                spaces.push({row: row+1, col: col-1}, {row: row+1, col: col+1})
            }
        } else {
            spaces = [{row: row+1, col: col-1}, {row: row+1, col: col+1}]
            if(selectedPiece.king) {
                spaces.push({row: row-1, col: col-1}, {row: row-1, col: col+1})
            }
        }
        for(let i = 0; i < spaces.length; i++) {
            let space = spaces[i]
            if(space.row < grid.pieces.length && space.col < grid.pieces.length && space.row >= 0 && space.col >= 0) {
                if(this.pieces[space.row][space.col] == null) {
                    legalMoves.push(space)
                } else if(this.pieces[space.row][space.col].color != selectedPiece.color) {
                    let jumpSpaces = []
                    if(selectedPiece.color == "red") {
                        if(i == 0) {
                            jumpSpaces.push({row: row-2, col: col-2})
                        } else if(i == 1)  {
                            jumpSpaces.push({row: row-2, col: col+2})
                        } else if(selectedPiece.king) {
                            if(i == 2) {
                                jumpSpaces.push({row: row+2, col: col-2})
                            } else if(i == 3) {
                                jumpSpaces.push({row: row+2, col: col+2})
                            }
                        }
                    } else {
                        if(i == 0) {
                            jumpSpaces.push({row: row+2, col: col-2})
                        } else if(i == 1)  {
                            jumpSpaces.push({row: row+2, col: col+2})
                        } else if(selectedPiece.king) {
                            if(i == 2) {
                                jumpSpaces.push({row: row-2, col: col-2})
                            } else if(i == 3) {
                                jumpSpaces.push({row: row-2, col: col+2})
                            }
                        }
                    }
                    for(let j = 0; j < jumpSpaces.length; j++) {
                        let jumpSpace = jumpSpaces[j]
                        if(jumpSpace.row < grid.pieces.length && jumpSpace.col < grid.pieces.length && jumpSpace.row >= 0 && jumpSpace.col >= 0) {
                            if(this.pieces[jumpSpace.row][jumpSpace.col] == null) {
                                canDestroy = true
                                legalMoves.push(jumpSpace)
                            }
                        }
                    }
                }
            }
        }
        return {
            moves: legalMoves,
            canDestroy: canDestroy
        }
    }

    this.movePiece = function(row, col) {
        let destroyedPiece = false

        let temp1 = this.pieces[row][col]
        let temp2 = this.pieces[this.selectedTileCoords.row][this.selectedTileCoords.col]
        this.pieces[row][col] = temp2
        this.pieces[this.selectedTileCoords.row][this.selectedTileCoords.col] = temp1

        if(this.selectedTileCoords.row-row == 2 && this.selectedTileCoords.col-col == 2) {
            this.pieces[row+1][col+1] = null
            destroyedPiece = true
        } else if(this.selectedTileCoords.row-row == -2 && this.selectedTileCoords.col-col == -2) {
            this.pieces[row-1][col-1] = null
            destroyedPiece = true
        } else if(this.selectedTileCoords.row-row == 2 && this.selectedTileCoords.col-col == -2) {
            this.pieces[row+1][col-1] = null
            destroyedPiece = true
        } else if(this.selectedTileCoords.row-row == -2 && this.selectedTileCoords.col-col == 2) {
            this.pieces[row-1][col+1] = null
            destroyedPiece = true
        }

        return destroyedPiece
    }

}

let canJump = false

window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mouseup', mouseUpHandler, false);

function mouseDownHandler() {

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    if(winner == null) {
        let coordsClicked = grid.getClickedCoords(mouseX, mouseY)
        if(grid.selectedTileCoords == null && grid.pieces[coordsClicked.row][coordsClicked.col].color == players[turns%2]) {
            grid.selectedTileCoords = coordsClicked
            grid.legalMoves = grid.getLegalMoves(grid.selectedTileCoords.row, grid.selectedTileCoords.col).moves
        } else if(grid.selectedTileCoords != null) {
            if(isEqual(grid.selectedTileCoords, coordsClicked)) {
                grid.selectedTileCoords = null
                grid.legalMoves = null
                if(canJump) {
                    turns--
                }
            } else {
                if(isInList(grid.legalMoves, coordsClicked)) {
                    let destroyedPiece = grid.movePiece(coordsClicked.row, coordsClicked.col)
                    console.log(destroyedPiece ? "destroyedPiece" : "no destroyedPiece")
                    if(destroyedPiece == false) {
                        turns++
                        grid.selectedTileCoords = null
                        grid.legalMoves = null
                        canJump = false
                    } else {
                        grid.selectedTileCoords = {row: coordsClicked.row, col: coordsClicked.col}
                        if(grid.getLegalMoves(coordsClicked.row, coordsClicked.col).canDestroy) {
                            grid.legalMoves = grid.getLegalMoves(grid.selectedTileCoords.row, grid.selectedTileCoords.col).moves
                            canJump = true
                        } else {
                            turns++
                            grid.selectedTileCoords = null
                            grid.legalMoves = null
                            canJump = false
                        }
                    }
                }
            }
        }
    }

}

function mouseMoveHandler() {

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

}

function mouseUpHandler() {

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

}

let winner = null;

let grid = new Grid()
grid.setPieces()

function reset() {
    winner = null;
    grid = new Grid()
    grid.setPieces()
    canJump = false
    turns = 0
}

function animate() {

    requestAnimationFrame(animate);
    g.clearRect(0, 0, canvas.width, canvas.height);

    grid.draw()
    grid.drawOverlay()

    g.fillStyle = players[turns%2]
    g.fillRect(0, canvas.width, canvas.width, 40)

    //promote pieces to king
    for(let i = 0; i < grid.pieces.length; i++) {
        for(let j = 0; j < grid.pieces[i].length; j++) {
            if(grid.pieces[i][j] != null) {
                if((grid.pieces[i][j].color == "red" && i == 0) || (grid.pieces[i][j].color == "black" && i == 7)) {
                    grid.pieces[i][j].king = true
                }
            }
        }
    }

    //check for win
    let pieceCount = {"red": 0, "black": 0}
    for(let i = 0; i < grid.pieces.length; i++) {
        for(let j = 0; j < grid.pieces[i].length; j++) {
            if(grid.pieces[i][j] != null) {
                pieceCount[grid.pieces[i][j].color]++
            }
        }
    }
    if(winner == null) {
        if(pieceCount.red == 0) {
            winner = "black"
        } else if(pieceCount.black == 0) {
            winner = "red"
        }
    }
    if(winner != null) {
        g.globalAlpha = 0.75
        g.fillStyle = "white"
        g.fillRect(0, 0, canvas.width, canvas.height)
        g.textAlign = "center"
        g.fillStyle = winner
        g.globalAlpha = 1.0
        g.font = "Bold 36pt Arial"
        g.fillText(winner.toUpperCase() + " WINS", canvas.width/2, (canvas.height/2))
    }

}

animate();
