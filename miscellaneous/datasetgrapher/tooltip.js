function Tooltip(x, y, w, h, message) {

    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.message = message

    this.draw = function() {

        g.fillStyle = "white"
        g.fillRect(this.x, this.y, this.w, this.h)
        g.strokeStyle = "#ccc"
        g.lineWidth = "2"
        g.beginPath()
        g.rect(this.x, this.y, this.w, this.h)
        g.stroke()

        let lines = this.message.split("\n")
        g.fillStyle = "black"
        g.font = "13px helvetica"
        g.textAlign = "left"
        for(let i = 0; i < lines.length; i++) {
            let line = lines[i]
            g.fillText(line, this.x+10, this.y+20+(i*13))
        }

    }

    this.setPos = function(x, y) {
        this.x = x
        this.y = y
    }
}