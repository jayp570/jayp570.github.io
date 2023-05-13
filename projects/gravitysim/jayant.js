Object.defineProperty(Array.prototype, "min", {value: function() {
    let min = this[0]
    for(let i of this) {
        if(i < min) {
            min = i
        }
    }
    return min
}})
Object.defineProperty(Array.prototype, "max", {value: function() {
    let max = this[0]
    for(let i of this) {
        if(i > max) {
            max = i
        }
    }
    return max
}})
Object.defineProperty(Array.prototype, "sum", {value: function() {return this.reduce((a, b) => a+b, 0)}})
Object.defineProperty(Array.prototype, "mean", {value: function() {return this.sum()/this.length}})

class Jayant {

    constructor() {

    }

    static getDist(pos1, pos2) {
        return Math.sqrt((pos1.x-pos2.x)**2 + (pos1.y-pos2.y)**2)
    }

    static randomInt(min, max) {
        let num = Math.floor(Math.random() * (max - min + 1) + min)
        return num;
    }

    static frequencyDist(list) {
        let frequencies = {}
        for(let i of list) {
            frequencies[i] = 0
        }
        for(let i of list) {
            frequencies[i]++
        }
        return frequencies
    }
    
}

class Vector2 {

    constructor(x, y) {
        this.x = x
        this.y = y
    }
    
    getMagnitude() {
        return Math.sqrt(this.x**2 + this.y**2)
    }

    getAngle() {
        return Math.atan2(this.y, this.x)
    }

    static add(v1, v2) {
        return new Vector2(v1.x+v2.x, v1.y+v2.y)
    }

    static subtract(v1, v2) {
        return new Vector2(v1.x-v2.x, v1.y-v2.y)
    }

    static divide(v, num) {
        return new Vector2(v.x/num, v.y/num)
    }

    static multiply(v, num) {
        return new Vector2(v.x*num, v.y*num)
    }

    static dotProduct(v1, v2) {
        return (v1.x*v2.x)+(v1.y*v2.y)
    }

}

class Color {

    static mixedColor(base, add, perc) {
        let red = ((1-perc)*base.red)+(perc*add.red)
        let green = ((1-perc)*base.green)+(perc*add.green)
        let blue = ((1-perc)*base.blue)+(perc*add.blue)
        return new Color(red, green, blue);
    }

    static changeLightness(r, g, b, amount) {
        return `rgb(${r+amount},${g+amount},${b+amount})`
    }

}