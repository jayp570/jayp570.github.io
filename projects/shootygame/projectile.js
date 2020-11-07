class Projectile {

    constructor(imagePath, x, y, id, angle, speed, damage) {
        this.pos = {
            x: x,
            y: y
        }
        this.image = new Image()
        this.image.src = imagePath
    
        this.id = id
    
        this.angle = angle
        this.vel = {
            x: Math.cos(angle*(Math.PI/180))*speed,
            y: Math.sin(angle*(Math.PI/180))*speed
        }
    
        this.w = 7; this.h = 7;
    
        this.damage = damage
    
        this.particleEffects = []
    
        this.name = imagePath.substring(imagePath.indexOf("projectiles/")+"projectiles/".length, imagePath.indexOf(".png"))
    
        if(this.name == "rocket") {
            this.particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                angle: this.angle,
                particleAmount: 1,
                destroyTime: [0, 0],
                colors: ["#b1b1b1", "#7e7e7e"],
                fadeOut: 0.05,
                shrink: 0
            }, g))
            this.w = 43
            this.h = 19
        }
    }

    checkCollision(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.h;
        let x = this.pos.x-this.w/2;
        let y = this.pos.y-this.h/2;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                angle: this.angle,
                continuous: false,
                effectWidth: 100,
                particleAmount: Math.round(getMagnitude(this.vel))/3,
                size: [5, 15],
                destroyTime: [0, 5],
                colors: [object.hitColor] 
            }, g))
            return true;
        }
        return false;
    }

    checkCollisionPlayer(object) {
        let bX = object.pos.x-object.size/2;
        let bY = object.pos.y-object.size/2;
        let bW = object.size*2;
        let bH = object.size*2;
        let x = this.pos.x-this.w/2;
        let y = this.pos.y-this.h/2;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                angle: this.angle,
                continuous: false,
                effectWidth: 100,
                particleAmount: Math.round(getMagnitude(this.vel)),
                size: [5, 15],
                destroyTime: [0, 5],
                colors: [object.hitColor] 
            }, g))
            return true;
        }
        return false;
    }

    update(offsetX, offsetY) {
        this.pos.x += this.vel.x; this.pos.y += this.vel.y;
        this.pos.x -= offsetX; this.pos.y -= offsetY;
        if(this.name == "rocket" && getMagnitude(this.vel) < 15) {
            this.vel.x *= 1.04; this.vel.y *= 1.04
        }
        for(let effect of this.particleEffects) {
            effect.pos.x -= offsetX
            effect.pos.y -= offsetY
            for(let particle of effect.particles) {
                particle.pos.x -= offsetX
                particle.pos.y -= offsetY
            }
        }
    }

    draw() {
        for(let effect of this.particleEffects) {
            effect.update()
            effect.pos = JSON.parse(JSON.stringify(this.pos))
        }
        g.translate(this.pos.x, this.pos.y)
        g.rotate(this.angle*Math.PI/180)
        g.drawImage(this.image, -this.image.width+this.w/2, -this.image.height+this.h/2)
        g.rotate(-this.angle*Math.PI/180)
        g.translate(-this.pos.x, -this.pos.y)
    }

}


class Grenade extends Projectile {

    constructor(imagePath, x, y, id, angle, speed, damage) {
        super(imagePath, x, y, id, angle, speed, damage)
        this.angleThrown = angle;
        this.acc = {
            "x": 0,
            "y": 0
        }
        this.w = 22
        this.h = 26
        this.timer = 0
    }

    collisionReaction(collisionAngle) {
        if(collisionAngle >= 45 && collisionAngle <= 135) {
            this.vel.y *= -1
        } else if(collisionAngle <= 315 && collisionAngle >= 225) {
            this.vel.y *= -1
        } else if(collisionAngle > 135 && collisionAngle < 225) {
            this.vel.x *= -1
        } else {
            this.vel.x *= -1
        }
    }

    update(offsetX, offsetY) {
        this.acc.x = 0; this.acc.y = 0;
        this.acc.x += this.vel.x * FRICTION/3; this.acc.y += this.vel.y * FRICTION/3;
        this.vel.x += this.acc.x; this.vel.y += this.acc.y;
        this.angle += getMagnitude(this.vel)/2
        super.update(offsetX, offsetY)
        this.timer++;
    }

    draw() {
        g.globalAlpha = 0.5
        g.lineWidth = 3
        g.lineCap = "round"
        g.strokeStyle = "white"
        g.beginPath();
        g.moveTo(this.pos.x, this.pos.y);
        g.lineTo(this.pos.x-this.vel.x*5, this.pos.y-this.vel.y*5);
        g.stroke();
        g.globalAlpha = 1.0
        super.draw()
    }

}
                                                                            
class ThrownWeapon extends Projectile {
    constructor(imagePath, x, y, id, angle, speed, damage) {
        super(imagePath, x, y, id, angle, speed, damage)
        this.w = this.image.width;
        this.h = this.image.height
    }

    update(offsetX, offsetY) {
        this.angle += getMagnitude(this.vel)/2
        super.update(offsetX, offsetY)
    }
}





function explode(bullet, explosionForce) {
    for(let crateBlasted of crates) {
        if(getDist(crateBlasted, bullet) < 140) {
            crateBlasted.health -= 50
            let xDist = crateBlasted.pos.x+crateBlasted.w/2-bullet.pos.x
            let yDist = crateBlasted.pos.y+crateBlasted.h/2-bullet.pos.y
            let angle = Math.atan2(yDist, xDist)
            crateBlasted.vel.x += Math.cos(angle)*explosionForce*(2/3)
            crateBlasted.vel.y += Math.sin(angle)*explosionForce*(2/3)
        }
    }
    for(let i = 0; i < explosiveBarrels.length; i++) {
        let explosiveBarrelBlasted = explosiveBarrels[i]
        if(getDist(explosiveBarrelBlasted, bullet) < 140) {
            let xDist = explosiveBarrelBlasted.pos.x+explosiveBarrelBlasted.w/2-bullet.pos.x
            let yDist = explosiveBarrelBlasted.pos.y+explosiveBarrelBlasted.h/2-bullet.pos.y
            let angle = Math.atan2(yDist, xDist)
            explosiveBarrelBlasted.vel.x += Math.cos(angle)*explosionForce*(1/3)
            explosiveBarrelBlasted.vel.y += Math.sin(angle)*explosionForce*(1/3)
            explosiveBarrelBlasted.startingExplosionTimer = true
            explosiveBarrelBlasted.id = bullet.id
        }
    }
    for(let playerBlasted of players) {
        if(getDist(playerBlasted, bullet) < 170) {
            playerBlasted.health -= 50
            if(playerBlasted.id == bullet.id) {
                playerBlasted.health+=20
            } else {
                if(playerBlasted.health <= 0) {
                    addKillToPlayer(bullet.id);
                }
                
            }
            let xDist = playerBlasted.pos.x+playerBlasted.size/2-bullet.pos.x
            let yDist = playerBlasted.pos.y+playerBlasted.size/2-bullet.pos.y
            let angle = Math.atan2(yDist, xDist)
            playerBlasted.vel.x += Math.cos(angle)*explosionForce
            playerBlasted.vel.y += Math.sin(angle)*explosionForce
        }
    }
}