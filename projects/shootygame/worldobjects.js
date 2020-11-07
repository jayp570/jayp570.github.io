function Crate(x, y) {

    this.pos = {
        x: x,
        y: y
    }
    this.vel = {
        x: 0,
        y: 0
    }
    this.acc = {
        x: 0,
        y: 0
    }

    this.w = 60
    this.h = 60

    this.health = 50;

    this.hitColor = "moccasin"

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.w;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.draw = function() {
        g.fillStyle = "moccasin"
        if(this.health > 0) {
            g.fillRect(this.pos.x, this.pos.y, this.w, this.h)
        }
    }

    this.update = function(offsetX, offsetY) {
        this.acc.x = 0; this.acc.y = 0;
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.pos.x -= offsetX; this.pos.y -= offsetY;

        if(this.health <= 0) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false,
                particleAmount: 100,
                effectWidth: 360,
                colors: ["moccasin"],
                destroyTime: [0, 0],
                speed: [15, 20],
                size: [15, 25]
            }, g))
            items.push(new Gun(this.pos.x, this.pos.y, GUNNAMES[Math.floor(Math.random()*GUNNAMES.length)]))
        }
    }

}



function ExplosiveBarrel(x, y) {

    this.image = new Image()
    this.image.src = "assets/other/explosivebarrel.png"

    this.pos = {
        x: x,
        y: y
    }

    this.vel = {
        x: 0,
        y: 0
    }
    this.acc = {
        x: 0,
        y: 0
    }

    this.hitColor = "#B80000"

    this.id = -1

    this.health = 10
    this.startingExplosionTimer = false;

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.w;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.update = function(offsetX, offsetY) {

        this.acc.x = 0; this.acc.y = 0;
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.w = this.image.width
        this.h = this.image.height

        if(this.startingExplosionTimer) {
            this.health--
        }

        this.pos.x -= offsetX; this.pos.y -= offsetY;

    }

    this.draw = function() {
        g.drawImage(this.image, this.pos.x, this.pos.y)
        g.fillStyle = "blue"
    }

}