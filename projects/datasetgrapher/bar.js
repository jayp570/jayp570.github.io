function Bar(x, y, w, h, value, frequency) {

    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.value = value
    this.frequency = frequency
    this.highlighted = false

    this.draw = function() {
        g.fillStyle = "#308CFF"
        if(this.highlighted) {
            g.fillStyle = "#66aaff"
        }
        g.fillRect(this.x, this.y, this.w, this.h)
    }

    this.checkCollision = function(mX, mY) {
        m = {x: mX, y: mY}
        return m.x > this.x && m.x < this.x+this.w && m.y > GRAPHOFFSET && m.y < GRAPHOFFSET+graphHeight
    }
}