function Water(x, y) {
    
    let settings = new Settings();

    this.pos = {
        "x": x, 
        "y": y
    }
    this.dimensions = {
        "w": settings.tileSize,
        "h": settings.tileSize
    }

    this.name = "water"

    this.draw = function(g) {
        g.fillStyle = "rgb(5,179,244)";
        g.fillRect(this.pos.x, this.pos.y, this.dimensions.w, this.dimensions.h);
    }    

    this.getPos = function() {
        return this.pos;
    }

    this.getDimensions = function() {
        return this.dimensions;
    }

    this.getName = function() {
        return this.name;
    }

}