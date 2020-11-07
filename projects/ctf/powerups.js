function Powerup(name) {

    this.name = name;
    this.img = new Image();
    this.img.src = "images/"+name+"Powerup.png";

    this.pos = {
        "x": canvas.width/2-49,
        "y": Math.random()*(canvas.height-64)
    }
    this.w = 90;
    this.h = 90;

    this.update = function(g) {
        this.pos.x = canvas.width/2-49;
        g.drawImage(this.img,this.pos.x,this.pos.y);
    }

    this.getPos = function() {
        return {"x": this.pos.x, "y": this.pos.y};
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

}

/*
shotgun
infiniteAmmo
swiftness
fastDashCooldown
*/