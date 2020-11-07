function Bot(x, y, team, id) {

    this.id = id;

    this.pos = {
        x: x,
        y: y
    }
    this.size = 20
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.input = {
        left: false,
        right: false,
        up: false,
        down: false
    }

    this.team = team

    this.maxHealth = 100
    this.health = this.maxHealth

    this.maxDashMeter = 100
    this.dashMeter = this.maxDashMeter

    this.playerAngle = 0
    this.aimAngle = 0

    this.grenadeCount = 5

    this.bullets = []
    this.grenades = []

    this.heldSlot = 0
    this.heldGun = null;

    this.posOnMap = {
        x: this.pos.x-map.pos.x,
        y: this.pos.y-map.pos.y
    }

    this.hitColor = this.team

    this.kills = 0;
    this.deaths = 0;


    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.h;
        let x = this.pos.x-this.size/2;
        let y = this.pos.y-this.size/2;
        let w = this.size;
        let h = this.size;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.shoot = function() {

        if(this.heldGun.clip > 0 && this.heldGun.reloading == false && this.heldGun.canFire) {

            let firePoint = {
                x: this.pos.x+(Math.cos(this.aimAngle*(Math.PI/180))*55),
                y: this.pos.y+(Math.sin(this.aimAngle*(Math.PI/180))*55)
            }

            if(this.heldGun.name == "pistol") {
                this.bullets.push(new Projectile(
                    "assets/projectiles/bullet.png", 
                    firePoint.x, firePoint.y,
                    this.id, 
                    this.aimAngle, 
                    30, 
                    20
                ))
            } else if(this.heldGun.name == "shotgun") {
                let spread = [0, Math.random()*10+10, Math.random()*(-10)+10]
                for(let i = 0; i < 3; i++) {
                    this.bullets.push(new Projectile(
                        "assets/projectiles/bullet.png", 
                        firePoint.x, firePoint.y,
                        this.id, 
                        this.aimAngle+spread[i], 
                        30, 
                        20
                    ))
                    if(i == 0) {
                        this.vel.x -= this.bullets[this.bullets.length-1].vel.x/2
                        this.vel.y -= this.bullets[this.bullets.length-1].vel.y/2
                    }
                }
            } else if(this.heldGun.name == "rocketlauncher") {
                firePoint = {
                    x: this.pos.x+(Math.cos(this.aimAngle*(Math.PI/180))*100),
                    y: this.pos.y+(Math.sin(this.aimAngle*(Math.PI/180))*100)
                }
                this.bullets.push(new Projectile(
                    "assets/projectiles/rocket.png", 
                    firePoint.x, firePoint.y,
                    this.id, 
                    this.aimAngle, 
                    4, 
                    25
                ))
                this.vel.x -= this.bullets[this.bullets.length-1].vel.x/3
                this.vel.y -= this.bullets[this.bullets.length-1].vel.y/3
            } else if(this.heldGun.name == "grenadelauncher") {
                firePoint = {
                    x: this.pos.x+(Math.cos(this.aimAngle*(Math.PI/180))*100),
                    y: this.pos.y+(Math.sin(this.aimAngle*(Math.PI/180))*100)
                }
                this.grenades.push(new Grenade(
                    "assets/projectiles/grenade.png", 
                    firePoint.x, 
                    firePoint.y,
                    this.id,
                    this.aimAngle,
                    30,
                    5
                ))
                this.vel.x -= this.grenades[this.grenades.length-1].vel.x/4
                this.vel.y -= this.grenades[this.grenades.length-1].vel.y/4
            }

            particleEffects.push(new ParticleEffect(firePoint.x, firePoint.y, MUZZLEFLASHPARTICLES, g))

            this.heldGun.lastShot = this.heldGun.frame

            this.heldGun.clip--

        }

        if(this.heldGun.clip == 0 && this.heldGun.reloading == false) {
            this.heldGun.reloadStartFrame = this.heldGun.frame
        }
    }

    this.throwWeapon = function() {

        if(this.heldGun.name != "pistol") {
            let firePoint = {
                x: this.pos.x+(Math.cos(this.aimAngle*(Math.PI/180))*55),
                y: this.pos.y+(Math.sin(this.aimAngle*(Math.PI/180))*55)
            }
    
            this.bullets.push(new ThrownWeapon(
                this.heldGun.image.src,
                firePoint.x, firePoint.y,
                this.id,
                this.aimAngle,
                20,
                50
            ))
    
            this.heldGun = null
        }
    }


    this.throwGrenade = function() {
        if(this.grenadeCount > 0) {
            this.grenades.push(new Grenade(
                "assets/projectiles/grenade.png", 
                this.pos.x, 
                this.pos.y,
                this.id,
                this.aimAngle,
                20,
                0
            ))
            this.grenadeCount--
        }
    }

    this.dash = function() {
        if(this.dashMeter >= 50) {
            if(this.input.left) {
                this.vel.x = -30
            }
            if(this.input.up) {
                this.vel.y = -30
            }
            if(this.input.right) {
                this.vel.x = 30
            }
            if(this.input.down) {
                this.vel.y = 30
            }
            this.dashMeter-=DASHCOST
            if(this.dashMeter < 0) {
                this.dashMeter = 0
            }
            this.playerAngle = Math.atan2(this.vel.y, this.vel.x) * (180/Math.PI)
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false, 
                colors: ["#fff"],
                angle: this.playerAngle,
                particleAmount: 20,
                destroyTime: [0, 5],
                fadeOut: 0.01,
                effectWidth: 50,
                shrink: 1,
                size: [7, 15],
                shapes: ["circle"],
            }, g))
        }
    }

    this.switchDirections = function() {
        if(this.input.left) {
            this.input.left = false;
            this.input.right = true;
        } else if(this.input.right) {
            this.input.left = true;
            this.input.right = false;
        }
        if(this.input.down) {
            this.input.down = false;
            this.input.up = true;
        } else if(this.input.up) {
            this.input.down = true;
            this.input.up = false;
        }
    }

    this.findNearest = function(list) {
        let targetDist = getDistPos(this.pos, list[0].pos)
        let target = list[0]
        for(let player of list) {
            if(player.id != this.id) {
                if(targetDist > getDistPos(this.pos, player.pos)) {
                    targetDist = getDistPos(this.pos, player.pos)
                    target = player
                }
            }
        }
        return target
    }

    this.goTo = function(pos) {

        let targetPos = pos
        if(targetPos.x > this.pos.x) {
            this.input.right = true;
        } else if(targetPos.x < this.pos.x) {
            this.input.left = true;
        }
        if(targetPos.y > this.pos.y) {
            this.input.down = true;
        } else if(targetPos.y < this.pos.y) {
            this.input.up = true;
        }

    }

    this.aim = function() {
        let trackingSpeed = 5;

        let target = this.findNearest(players)
        let distX = target.pos.x - this.pos.x
        let distY = target.pos.y - this.pos.y
        let newAimAngle = Math.atan2(distY, distX)*(180/Math.PI)
        if(newAimAngle < 0) {
            newAimAngle += 360
        } 
        if(newAimAngle - this.aimAngle < 0 && newAimAngle - this.aimAngle < -trackingSpeed) {
            newAimAngle = this.aimAngle - trackingSpeed
        } else if(newAimAngle - this.aimAngle > 0 && newAimAngle - this.aimAngle > trackingSpeed) {
            newAimAngle = this.aimAngle + trackingSpeed
        }
        this.aimAngle = newAimAngle
    }

    this.avoid = function() {
        if(getDistPos(this.findNearest(players).pos, this.pos) < 160) {
            this.switchDirections()
        }
    }

    this.behave = function() {
        this.aim()
        // this.shoot()
        // this.goTo(this.findNearest(players).pos)
        // this.avoid()
    }

    this.collisionReaction = function(collisionAngle) {
        if(collisionAngle >= 45 && collisionAngle <= 135) {
            this.vel.y *= -1.1
        } else if(collisionAngle <= 315 && collisionAngle >= 225) {
            this.vel.y *= -1.1
        } else if(collisionAngle > 135 && collisionAngle < 225) {
            this.vel.x *= -1.1
        } else {
            this.vel.x *= -1.1
        }
    }

    this.update = function(offsetX, offsetY) {
        this.behave()

        this.acc.x = 0; this.acc.y = 0;
        if(this.input.left) {
            this.acc.x = -ACCELERATION;
        }
        if(this.input.right) {
            this.acc.x = ACCELERATION;
        }
        if(this.input.up) {
            this.acc.y = -ACCELERATION;
        }
        if(this.input.down) {
            this.acc.y = ACCELERATION;
        }
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.pos.x -= offsetX;               this.pos.y -= offsetY;

        this.posOnMap = {
            x: this.pos.x-map.pos.x,
            y: this.pos.y-map.pos.y
        }


        this.input.right = false;
        this.input.left = false;
        this.input.down = false;
        this.input.up = false;

        //this.playerAngle = Math.atan2(this.vel.y, this.vel.x) * (180/Math.PI)

        if(this.health <= 0) {
            this.deaths++;
            this.heldGun.carrier = null;
            this.heldGun = null;
            this.health = this.maxHealth
            this.dashMeter = this.maxDashMeter
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false,
                particleAmount: 100,
                effectWidth: 360,
                colors: [this.hitColor],
                destroyTime: [0, 0],
                speed: [15, 20],
                size: [15, 25]
            }, g))
            //respawn
            let repawnPos = getRandomPos()
            this.pos.x -= this.posOnMap.x - repawnPos.x; this.pos.y -= this.posOnMap.y - repawnPos.y; 
            this.vel = {x: 0, y: 0}
        }

        this.dashMeter += 1
        if(this.dashMeter > this.maxDashMeter) {
            this.dashMeter = this.maxDashMeter
        }
    }

    this.updateItems = function() {
        this.heldGun.update(0, 0)
        this.heldGun.angle = this.aimAngle
        this.heldGun.frame++;

        for(let bullet of this.bullets) {
            bullet.update(players[0].vel.x, players[0].vel.y)
        }

        for(let grenade of this.grenades) {
            grenade.update(players[0].vel.x, players[0].vel.y)
        }
    }

    this.draw = function() {
        for(let bullet of this.bullets) {
            bullet.draw()
        }
        for(let grenade of this.grenades) {
            grenade.draw()
        }
        g.fillStyle = this.team
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.size,0,2*Math.PI,false);
        g.fill();
        if(this.heldGun != null) {
            this.heldGun.draw()
        }
    }

    this.drawHud = function() {
        g.globalAlpha = 0.6
        g.fillStyle = "black"
        g.fillRect(this.pos.x-this.maxHealth/3, this.pos.y-40, this.maxHealth/1.5, 10)
        g.globalAlpha = 1.0
        g.fillStyle = "lime"
        g.fillRect(this.pos.x-this.maxHealth/3, this.pos.y-40, this.health/1.5, 10)
    }
}










const BOTNAMES = {
    0: "YOU",
    1: "ClearCrocodile",
    2: "AmusingTiger",
    3: "MagicalChicken",
    4: "HystericalIbex",
    5: "PeriodicAardvark",
    6: "LumpyLizard",
}