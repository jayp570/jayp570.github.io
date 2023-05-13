let canvas = document.querySelector("canvas");

canvas.width = 1200;
canvas.height = 800;

let g = canvas.getContext("2d");

let grid = [];
document.getElementById("size").value = "5";

const ACCELERATION = 2
const FRICTION = -0.05 //-0.05

let tileSize = Math.ceil(100/parseInt(document.getElementById("size").value))

function Tile(x, y, num, tileSize) {

    this.pos = {x: x, y: y}
    this.w = tileSize;
    this.h = tileSize;
    this.wall = false;
    if(num == 1) {
        this.wall = true;
    }

    this.draw = function() {
        g.fillStyle = "white"
        if(this.wall == true) {
            g.fillStyle = "black";
        }
        g.fillRect(this.pos.x, this.pos.y, this.w, this.h);
    }
}

function Player(startPos, tileSize) {

    this.pos = {
        x: startPos.x,
        y: startPos.y
    }
    this.size = tileSize/3;
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.input = {
        left: false,
        right: false,
        up: false,
        down: false
    }

    this.setDirection = function(code,bool) {

        switch(code) {
            case 65: this.input.left = bool; break;
            case 87: this.input.up = bool; break;
            case 68: this.input.right = bool; break;
            case 83: this.input.down = bool; break;
            default: ;
        }

        // if(code == 65) {
        //     this.input.left = bool;
        // } else if(code == 68) {
        //     this.input.right = bool;
        // } else if(code == 87) {
        //     this.input.up = bool
        // } else if(code == 83) {
        //     this.input.down = bool
        // }
        
    }

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.w;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.size;
        let h = this.size;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.update = function() {
        
        this.acc.x = 0; this.acc.y = 0;
        if(this.input.left) {
            this.acc.x = -ACCELERATION;
        }
        if(this.input.right) {
            this.acc.x = ACCELERATION;
        }
        if(this.input.up) {
            this.acc.y = -ACCELERATION;
        }
        if(this.input.down) {
            this.acc.y = ACCELERATION;
        }
        // this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        // this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        // this.pos.x += this.vel.x;               this.pos.y += this.vel.y;
        this.pos.x += this.acc.x;               this.pos.y += this.acc.y;
    }

    this.draw = function() {
        g.fillStyle = "red"
        g.fillRect(this.pos.x, this.pos.y, this.size, this.size)
    }

}

function generateMaze() {


    tileSize = Math.ceil(100/parseInt(document.getElementById("size").value))

    function makeGrid() {
        grid = [];
        for(let i = 0; i < canvas.height/tileSize; i++) {
            grid.push([]);
            for(let j = 0; j < canvas.width/tileSize; j++) {
                grid[i].push(1);
            }
        }
    }

    function mazeAlgorithm() {

        for(let i = 1; i < grid.length-1; i++) {
            if(i%2 == 1) {
                if(i == 1) {
                    for(let j = 1; j < grid[i].length-1; j++) {
                        grid[i][j] = 0;
                    }
                } else {
                    let startPosition = 1;
                    while(startPosition < grid[i].length) {
                        let corridorLength = Math.round(Math.random()*10+1)
                        let leftRightChance = Math.round(Math.random())
                        if(corridorLength+startPosition > grid[0].length-1) {
                            corridorLength = grid[0].length-1-startPosition
                        }
                        for(let j = startPosition; j < startPosition+corridorLength; j++) {
                            grid[i][j] = 0;
                            if(leftRightChance == 0) {
                                if(j == startPosition) {
                                    if(grid[i-2][j] == 0) {
                                        grid[i-1][j] = 0;
                                    } else {
                                        for(let k = i-1; k > 0; k--) {
                                            if(grid[k][j] == 0) {
                                                break;
                                            } else {
                                                grid[k][j] = 0;
                                            }
                                        }
                                    }
                                }
                            }
                            if(leftRightChance == 1) {
                                if(j == startPosition+corridorLength-1) {
                                    if(grid[i-2][j] == 0) {
                                        grid[i-1][j] = 0;
                                    } else {
                                        for(let k = i-1; k > 0; k--) {
                                            if(grid[k][j] == 0) {
                                                break;
                                            } else {
                                                grid[k][j] = 0;
                                            }
                                        }
                                    }
                                }
                            }
                            
                        }
                        startPosition+=corridorLength;
                        startPosition++;
                    }
                }
            }
        }

        for(let i = 2; i < grid.length; i++) {
            if(i%2 == 0) {
                for(let j = 0; j < grid[i].length-1; j++) {
                    if(grid[i][j] == 0 && grid[i][j+1] == 0) {
                        grid[i][j] = 1;
                    }
                }
            }
        }
        console.log(grid)
    }

    function generateTiles() {
        for(let i = 0; i < grid.length; i++) {
            for(let j = 0; j < grid[i].length; j++) {
                grid[i][j] = new Tile(j*tileSize, i*tileSize, grid[i][j], tileSize);
            }
        }
    }

    makeGrid();
    mazeAlgorithm();
    generateTiles();

}

generateMaze();


let player = new Player({x: 25, y: 25}, tileSize);

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
function keyDownHandler(e) {
    let code = e.keyCode;
    player.setDirection(code,true);
}
function keyUpHandler(e) {
    let code = e.keyCode;
    player.setDirection(code,false);
}

let previousPos = JSON.parse(JSON.stringify(player.pos))

function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);

    player.update();

    let collidedThisFrame = false;

    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            grid[i][j].draw();
            if(grid[i][j].wall) {
                if(player.checkCollision(grid[i][j])) {
                    player.pos = previousPos
                    collidedThisFrame = true;
                }
            }
        }
    }

    player.draw();

    previousPos = JSON.parse(JSON.stringify(player.pos))
    console.log()
}

animate();

