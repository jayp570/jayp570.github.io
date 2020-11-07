function Human(x, y) {

    this.pos = {
        "x": x, 
        "y": y
    }
    this.dimensions = {
        "w": 3,
        "h": 3
    }

    this.civlization = ""

    this.draw = function(g) {
        g.fillStyle = "white";
        g.fillRect(this.pos.x, this.pos.y, this.dimensions.w, this.dimensions.h);
    }    

    this.getPos = function() {
        return this.pos;
    }

    this.getDimensions = function() {
        return this.dimensions;
    }

    this.getCivilization = function() {
        return this.civlization;
    }

}