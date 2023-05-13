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

    static addList(vectors) {
        let sum = new Vector2(0, 0)
        for(let v of vectors) {
            sum.x += v.x
            sum.y += v.y
        }
        return sum
    }

    static subtract(v1, v2) {
        return new Vector2(v1.x-v2.x, v1.y-v2.y)
    }

    static divide(v, num) {
        return new Vector2(v.x/num, v.y/num)
    }

    static getDist(v1, v2) {
        return Math.sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2)
    }

    static multiply(v, num) {
        return new Vector2(v.x*num, v.y*num)
    }

    static dotProduct(v1, v2) {
        return (v1.x*v2.x)+(v1.y*v2.y)
    }

}