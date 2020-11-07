let canvas = document.querySelector("canvas");

canvas.width = 1200;
canvas.height = 800;

let g = canvas.getContext("2d");
const CELLSIZE = 10;

let grid = [];
let gridDim = {
    w: canvas.width/CELLSIZE,
    h: canvas.height/CELLSIZE
}
for(let i = 0; i < gridDim.h; i++) {
    grid.push([]);
    for(let j = 0; j < gridDim.w; j++) {
        grid[i].push(0)
    }
}

let running = false;
let gridLines = false;


function updateGrid() {
    
    let gridCopy = JSON.parse(JSON.stringify(grid))
    for(let i = 1; i < grid.length-1; i++) {
        for(let j = 1; j < grid[i].length-1; j++) {
            let livingNeighbors = 0;
            livingNeighbors += grid[i-1][j]
            livingNeighbors += grid[i+1][j]
            livingNeighbors += grid[i][j-1]
            livingNeighbors += grid[i][j+1]
            livingNeighbors += grid[i-1][j-1]
            livingNeighbors += grid[i+1][j+1]
            livingNeighbors += grid[i-1][j+1]
            livingNeighbors += grid[i+1][j-1]
            if(grid[i][j] == 1) {
                if(livingNeighbors < 2) {
                    gridCopy[i][j] = 0;
                } else if(livingNeighbors > 3) {
                    gridCopy[i][j] = 0;
                }
            } else {
                if(livingNeighbors == 3) {
                    gridCopy[i][j] = 1;
                }
            }
        }
    }
    grid = JSON.parse(JSON.stringify(gridCopy))

}

window.addEventListener("mousedown", mouseDownHandler, false);
window.addEventListener("mouseup", mouseUpHandler, false);
window.addEventListener("mousemove", mouseMoveHandler, false);

function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let row = parseInt(mouseY/CELLSIZE)
    let col = parseInt(mouseX/CELLSIZE)
    if(col < canvas.width/CELLSIZE && col >= 0 && row < canvas.height/CELLSIZE && row >= 0) {
        let clickedCell = grid[row][col]
        if(clickedCell == 1) {
            grid[row][col] = 0
        } else {
            grid[row][col] = 1
        }
    }
}

function mouseUpHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
}

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
}

function start() {
    running = !running;
    if(running) {
        document.getElementById("startButton").innerHTML = "Pause"
    } else {
        document.getElementById("startButton").innerHTML = "Start"
    }
}

function clearGrid() {
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            grid[i][j] = 0;
        }
    }
}

function toggleGridLines() {
    gridLines = !gridLines;
}


function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            g.fillStyle = "gray"
            g.fillRect(j*CELLSIZE, i*CELLSIZE, CELLSIZE, CELLSIZE)
            g.fillStyle = "white"
            if(grid[i][j] == 0) {
                g.fillStyle = "black"
            }
            if(!gridLines) {
                g.fillRect(j*CELLSIZE, i*CELLSIZE, CELLSIZE, CELLSIZE)
            } else {
                g.fillRect(j*CELLSIZE+1, i*CELLSIZE+1, CELLSIZE-1, CELLSIZE-1)
            }
        }
    }
    if(running) {
        updateGrid();
    }
}

animate();


