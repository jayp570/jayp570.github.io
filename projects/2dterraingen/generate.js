let canvas = document.querySelector("canvas");

canvas.width = 500;
canvas.height = 500;

let g = canvas.getContext("2d");

function getRandomNum(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1) + min)
    return num;
}

function getAverage(list) {
    let sum = 0
    for(let i = 0; i < list.length; i++) {
        sum += list[i]
    }
    return sum/list.length
}

function getEmptyList(size) {
    let list = []; for(let i = 0; i < size; i++) {list.push(null)}
    return list
}

function getMixedColors(base, add, perc) {
    let red = ((1-perc)*base[0])+(perc*add[0])
    let green = ((1-perc)*base[1])+(perc*add[1])
    let blue = ((1-perc)*base[2])+(perc*add[2])
    return "rgb("+red+","+green+","+blue+")";
}

let terrain = [
    [10,12,10],
    [12,200,12],
    [10,12,10]
]

let iterations = 6

let maxDisplacement = 100
let smoothingFactor = 1.75

let terrainCopy = JSON.parse(JSON.stringify(terrain))

function iterate() {    
    terrainCopy = JSON.parse(JSON.stringify(terrain))
    for(let i = 0; i < terrain.length; i++) {
        let xValuesAdded = 0
        for(let j = 0; j < terrain[i].length-1; j++) {
            let displacement = getRandomNum(-1*maxDisplacement, maxDisplacement)
            terrainCopy[i].splice(j+1+xValuesAdded, 0, getAverage([terrain[i][j], terrain[i][j+1]])+displacement)
            xValuesAdded++
        }
    }

    terrain = JSON.parse(JSON.stringify(terrainCopy))

    let yValuesAdded = 0
    for(let i = 0; i < terrain.length-1; i++) {
        let insertedList = getEmptyList(terrainCopy[0].length)
        for(let j = 0; j < insertedList.length; j+=2) {
            let displacement = getRandomNum(-1*maxDisplacement, maxDisplacement)
            insertedList[j] = getAverage([terrain[i][j], terrain[i+1][j]])+displacement
        }
        terrainCopy.splice(i+1+yValuesAdded, 0, insertedList)
        yValuesAdded++
    }

    terrain = JSON.parse(JSON.stringify(terrainCopy))

    for(let i = 0; i < terrain.length; i++) {
        for(let j = 0; j < terrain[i].length; j++) {
            if(terrain[i][j] == null) {
                let displacement = getRandomNum(-1*maxDisplacement, maxDisplacement)
                terrainCopy[i][j] = getAverage([terrain[i+1][j], terrain[i-1][j], terrain[i][j+1], terrain[i][j-1]])+displacement
            }
        }
    }

    maxDisplacement = maxDisplacement/smoothingFactor
    terrain = JSON.parse(JSON.stringify(terrainCopy))

    //render()
}

//generating terrain values
for(let iteration = 1; iteration <= iterations; iteration++) {

    iterate()
    console.log(terrain)

}

function getHeightmap() {
    let data = []
    for(let i = 0; i < terrain.length; i++) {
        for(let j = 0; j < terrain[i].length; j++) {
            data.push(terrain[i][j])
        }
    }
    console.log(data)
    return data
}


function render() {
    //rendering
    g.clearRect(0, 0, canvas.width, canvas.height)
    let xDimension = terrain[0].length
    let yDimension = terrain.length
    for(let i = 0; i < terrain.length; i++) {
        for(let j = 0; j < terrain[i].length; j++) {
            if(terrain[i][j] < 125) {
                g.fillStyle = getMixedColors([0, 0, 255], [terrain[i][j], terrain[i][j], terrain[i][j]], 0.5)
            } else if(terrain[i][j] < 140) {
                g.fillStyle = getMixedColors([234, 205, 93], [terrain[i][j], terrain[i][j], terrain[i][j]], 0.5)
            } else if(terrain[i][j] < 200) {
                g.fillStyle = getMixedColors([14, 210, 16], [terrain[i][j], terrain[i][j], terrain[i][j]], 0.5)
            } else {
                g.fillStyle = getMixedColors([121, 119, 119], [terrain[i][j], terrain[i][j], terrain[i][j]], 0.5)
            }
            let tileSize = canvas.width/(terrain.length)
            g.fillRect(j*tileSize, i*tileSize, tileSize+1, tileSize+1)
        }
    }
}

function getDisplacementMap() {
    g.clearRect(0, 0, canvas.width, canvas.height)
    let xDimension = terrain[0].length
    let yDimension = terrain.length
    for(let i = 0; i < terrain.length; i++) {
        for(let j = 0; j < terrain[i].length; j++) {
            if(terrain[i][j] < 125) {
                g.fillStyle = getMixedColors([255, 255, 255], [terrain[i][j], terrain[i][j], terrain[i][j]], 1)
            } else if(terrain[i][j] < 140) {
                g.fillStyle = getMixedColors([255, 255, 255], [terrain[i][j], terrain[i][j], terrain[i][j]], 1)
            } else if(terrain[i][j] < 200) {
                g.fillStyle = getMixedColors([255, 255, 255], [terrain[i][j], terrain[i][j], terrain[i][j]], 1)
            } else {
                g.fillStyle = getMixedColors([255, 255, 255], [terrain[i][j], terrain[i][j], terrain[i][j]], 1)
            }
            let tileSize = canvas.width/(terrain.length)
            g.fillRect(j*tileSize, i*tileSize, tileSize+1, tileSize+1)
        }
    }

    let displacementMap = document.getElementById("canvas").toDataURL("image/png")
    render()
    return displacementMap
}

function getTextureMap() {
    render()
    let textureMap = document.getElementById("canvas").toDataURL("image/png")
    return textureMap
}

render()



/*
let displacement = getRandomNum(-1*maxDisplacement, maxDisplacement)
terrain[i].splice(j+1, 0, getAverage(terrain[i][j], terrain[i][j+1])+displacement)
*/