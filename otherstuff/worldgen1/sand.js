function Sand(x, y) {
    
    let settings = new Settings();

    this.pos = {
        "x": x, 
        "y": y
    }
    this.dimensions = {
        "w": settings.tileSize,
        "h": settings.tileSize
    }

    this.name = "sand"

    this.draw = function(g) {
        g.fillStyle = "rgb(240,230,140)";
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