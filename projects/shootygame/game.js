let canvas = document.querySelector("canvas");

canvas.width = 1280;
canvas.height = 720;

let g = canvas.getContext("2d");

let cursorPos = {x: 0, y: 0}
let crosshairImage = new Image()
crosshairImage.src = "assets/hud/crosshair.png"

const ACCELERATION = 0.85
const FRICTION = -0.1 //-0.05

const DASHCOST = 30;

const GUNNAMES = ["shotgun", "rocketlauncher", "grenadelauncher"]

let showingLeaderboard = false;

const EXPLOSIONPARTICLES =  {
    speed: [1, 10], 
    size: [1, 70],
    shapes: ["circle"],
    effectWidth: 360,
    destroyTime: [5, 15],
    fadeOut: 0,
    shrink: 6,
    angle: 90,
    colors: ["yellow", "darkorange", "orange", "gray", "darkgray", "red"],
    particleAmount: 100,
    continuous: false,
    effectVel: {x: 0, y: 0},
    glowAmount: 20
}

const MUZZLEFLASHPARTICLES = {
    destroyTime: [0, 0],
    effectWidth: 360,
    continuous: false,
    speed: [0, 5],
    particleAmount: 20,
    shrink: 3,
    colors: ["yellow", "orange", "gold"],
    glowAmount: 10
}

function Tile(x, y, state) {

    this.state = state
    if(this.state == ".") {
        this.state = 0
    } else if(this.state = "o") {
        this.state = 1
    }

    this.pos = {
        x: x,
        y: y
    }

    this.w = TILESIZE
    this.h = TILESIZE

    this.hitColor = "#ccc"

    this.draw = function() {
        if(this.state == 0) {
            g.fillStyle = "#3a3a3a"
        } else {
            g.fillStyle = "#ccc"
        }
        g.fillRect(this.pos.x, this.pos.y, this.w+1, this.h+1)
    }
}

function Map(x, y, map) {

    this.pos = {
        x: x,
        y: y
    }

    let mapRows = map.map.split("\n")
    

    this.map = []
    let count = 0
    for(let i = 0; i < map.height; i++) {
        this.map.push([])
        for(let j = 0; j < map.width; j++) {
            this.map[i].push(new Tile(x+(j*TILESIZE), y+(i*TILESIZE), mapRows[i][j]))
        }
    }

    this.h = this.map.length*TILESIZE
    this.w = this.map[0].length*TILESIZE

    this.draw = function() {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].draw()
            }
        }
    }

    this.update = function(offsetX, offsetY) {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].pos.x -= offsetX
                this.map[i][j].pos.y -= offsetY
            }
        }
        this.pos.x -= offsetX; this.pos.y -= offsetY;
    }
}

function Player(x, y, team) {

    this.id = 0;

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

    this.grenadeCount = 1000

    this.bullets = []
    this.grenades = []

    this.heldGun = null;

    this.posOnMap = {
        x: this.pos.x-map.pos.x,
        y: this.pos.y-map.pos.y
    }

    this.hitColor = "red"

    this.kills = 0;
    this.deaths = 0;


    this.setDirection = function(code,bool) {

        switch(code) {
            case 65: this.input.left = bool; break;
            case 87: this.input.up = bool; break;
            case 68: this.input.right = bool; break;
            case 83: this.input.down = bool; break;
            default: ;
        }
        
    }

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

    this.update = function() {

        this.pos = {
            x: canvas.width/2,
            y: canvas.height/2
        }

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
        //this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.posOnMap = {
            x: this.pos.x-map.pos.x,
            y: this.pos.y-map.pos.y
        }

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
            playerRespawn(this.posOnMap.x, this.posOnMap.y, 300, 100)
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
        g.fillRect(10, canvas.height-90, this.maxHealth*4, 35)
        g.globalAlpha = 1.0
        g.fillStyle = "lime"
        g.fillRect(10, canvas.height-90, this.health*4, 35)

        g.globalAlpha = 0.6
        g.fillStyle = "black"
        g.fillRect(10, canvas.height-40, this.maxDashMeter*3, 25)
        g.globalAlpha = 1.0
        g.fillStyle = "cyan"
        g.fillRect(10, canvas.height-40, this.dashMeter*3, 25)

        g.fillStyle = "white"
        g.font = "bold 40px consolas"
        g.fillText(this.heldGun.clip+"/"+this.heldGun.maxClip, canvas.width-150, canvas.height-40) 
        if(this.heldGun.reloading) {
            let reloadBarLength = this.heldGun.frame-this.heldGun.reloadStartFrame 
            g.fillStyle = "white"
            g.fillRect((canvas.width/2)-this.heldGun.reloadSpeed/2, 10, this.heldGun.reloadSpeed, 15)  
            g.fillStyle = "gold"
            g.fillRect((canvas.width/2)-reloadBarLength/2, 10, reloadBarLength, 15)  
        }
    }
}


const TILESIZE = 125; //125
let rawMap = MAPS[0]
let map = new Map(0, 0, rawMap)
const CRATESPAWNRATE = Math.round(map.w*map.h*0.016/TILESIZE/TILESIZE)

let particleEffects = []

let players = [
    new Player(canvas.width/2, canvas.height/2, "red"),
    new Bot(1000, 100, "blue", 1),
    // new Bot(1000, 300, "yellow", 2),
    // new Bot(700, 100, "green", 3),
    // new Bot(900, 300, "purple", 4),
    // new Bot(1000, 400, "white", 6),
]

let items = []

let crates = [
    new Crate(100, 100), new Crate(200, 100)
]

let explosiveBarrels = [
    new ExplosiveBarrel(100, 200),
    new ExplosiveBarrel(100, 400),
    new ExplosiveBarrel(100, 600),
    new ExplosiveBarrel(100, 800)
]

let frame = 0


function playerRespawn(playerX, playerY, respawnX, respawnY) {
    
    let x = playerX-respawnX
    let y = playerY-respawnY



    map.pos.x += x; map.pos.y += y;
    for(let i = 0; i < map.map.length; i++) {
        for(let j = 0; j < map.map[i].length; j++) {
            map.map[i][j].pos.x += x; map.map[i][j].pos.y += y;
        }
    }

    for(let crate of crates) {
        crate.pos.x += x; crate.pos.y += y;
    }

    for(let explosiveBarrel of explosiveBarrels) {
        explosiveBarrel.pos.x += x; explosiveBarrel.pos.y += y;
    }

    for(let player of players) {
        if(player.id != 0) {
            player.pos.x += x; player.pos.y += y
        }
        for(let bullet of player.bullets) {
            bullet.pos.x += x; bullet.pos.y += y;
            for(let effect of bullet.particleEffects) { 
                effect.pos.x += x; effect.pos.y += y
            }
        }
        for(let grenade of player.grenades) {
            grenade.pos.x += x; grenade.pos.y += y;
        }
    }

    for(let item of items) {
        if(item.carrier == null) {
            item.pos.x += x; item.pos.y += y;
        }
    }

    for(let effect of particleEffects) {
        effect.pos.x += x; effect.pos.y += y;
        for(let particle of effect.particles) {
            particle.pos.x += x; particle.pos.y += y;
        }
    }

}



function animate() {
    requestAnimationFrame(animate);
	
    //updates map
    map.update(players[0].vel.x, players[0].vel.y)

    //makes sure players have a gun
    for(let player of players) {
        if(player.heldGun == null) {
            items.push(new Gun(0, 0, "pistol"))
            items[items.length-1].carrier = player
            player.heldGun = items[items.length-1]
        }
    }

    //makes sure there are no unused guns
    for(let i = 0; i < items.length; i++) {
        if(items[i].name == "pistol" && items[i].carrier == null) {
            items.splice(i, 1)
        }
    }

    //checks crate collision with walls
    for(let crate of crates) {
        outerWallLoop:
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(crate.checkCollision(map.map[i][j])) {
                        crate.vel.x*=-1; crate.vel.y*=-1;
                        break outerWallLoop;
                    }
                }
                
            }
        }
    }

    //updates crates and deletes destroyed crates
    for(let i = 0; i < crates.length; i++) {
        let crate = crates[i]
        crate.update(players[0].vel.x, players[0].vel.y)
        if(crate.health <= 0) {
            crates.splice(i, 1)
        }
    }

    //checks explosive barrel collision with walls
    for(let explosiveBarrel of explosiveBarrels) {
        outerWallLoop:
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(explosiveBarrel.checkCollision(map.map[i][j])) {
                        explosiveBarrel.vel.x*=-1; explosiveBarrel.vel.y*=-1;
                        break outerWallLoop;
                    }
                }
                
            }
        }
    }

    //updates explosive barrels and deletes destroyed explosive barrels
    for(let i = 0; i < explosiveBarrels.length; i++) {
        let explosiveBarrel = explosiveBarrels[i]
        explosiveBarrel.update(players[0].vel.x, players[0].vel.y)
        if(explosiveBarrel.health <= 0) {
            particleEffects.push(new ParticleEffect(explosiveBarrel.pos.x, explosiveBarrel.pos.y, EXPLOSIONPARTICLES, g))
            explode(explosiveBarrel, 60)
            explosiveBarrels.splice(i, 1)
        }
    }

    //updates items
    for(let item of items) {
        if(item.carrier == null) {
            item.update(players[0].vel.x, players[0].vel.y)
        }
    }


    //spawns crates periodically
    if(frame%1 == 0) {
        if(crates.length < CRATESPAWNRATE) {
            let crateSpawnX = getRandomNum(map.pos.x, map.pos.x+map.w-100)
            let crateSpawnY = getRandomNum(map.pos.y, map.pos.y+map.h-100)
            let crateSpawn = new Crate(crateSpawnX, crateSpawnY)
            let inWall = false
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(crateSpawn.checkCollision(map.map[i][j])) {
                            inWall = true
                        }
                    }
                }
            }
            while(inWall == true) {
                crateSpawnX = getRandomNum(map.pos.x, map.pos.x+map.w-100)
                crateSpawnY = getRandomNum(map.pos.y, map.pos.y+map.h-100)
                crateSpawn = new Crate(crateSpawnX, crateSpawnY)
                inWall = false
                for(let i = 0; i < map.map.length; i++) {
                    for(let j = 0; j < map.map[i].length; j++) {
                        if(map.map[i][j].state == 1) {
                            if(crateSpawn.checkCollision(map.map[i][j])) {
                                inWall = true
                            }
                        }
                    }
                }
            }
            crates.push(crateSpawn)
        }
    }

    //updates items of player (grenades, bullets, guns)
    for(let player of players) {
        player.updateItems()
    }

    //updates player and bots
    for(let player of players) {
        if(player.id != 0) {
            player.update(players[0].vel.x, players[0].vel.y)
        }
    }
    players[0].update()

    //explodes grenades
    for(let player of players) {
        for(let num = 0; num < player.grenades.length; num++) {
            let grenade = player.grenades[num]
            if(grenade.timer > 200) {
                particleEffects.push(new ParticleEffect(grenade.pos.x, grenade.pos.y, EXPLOSIONPARTICLES, g))
                player.grenades.splice(num, 1)
                explode(grenade, 30)
            }
        }
    }

    //updates particle effects
    for(let effect of particleEffects) {
        effect.pos.x -= players[0].vel.x
        effect.pos.y -= players[0].vel.y
        for(let particle of effect.particles) {
            particle.pos.x -= players[0].vel.x
            particle.pos.y -= players[0].vel.y
        }
    }


    for(let player of players) {
        //checks player collision with walls
        outerWallLoop:
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(player.checkCollision(map.map[i][j])) {
                        let collisionAngle = getCollisionAngle(map.map[i][j], player)
                        player.collisionReaction(collisionAngle)
                        break outerWallLoop;
                    }
                }
                
            }
        }

        //checks player collision with crates
        for(let crate of crates) {
            if(player.checkCollision(crate)) {
                crate.vel.x += player.vel.x*1.5; crate.vel.y += player.vel.y*1.5;
                if(player.vel.x + player.vel.y >= 20) {
                    crate.health-=50
                }
            }
        }

        //checks player collision with explosive barrels
        for(let explosiveBarrel of explosiveBarrels) {
            if(player.checkCollision(explosiveBarrel)) {
                explosiveBarrel.vel.x += player.vel.x*1.25; explosiveBarrel.vel.y += player.vel.y*1.25;
            }
        }

        //checks if player is off the map
        if(player.checkCollision(map) == false) {
            player.health--;
        }

        //checks bullet collision
        for(let num = 0; num < player.bullets.length; num++) {
            
            let bullet = player.bullets[num]

            //checks bullet collision with wall
            outerWallLoop:
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(bullet.checkCollision(map.map[i][j])) {
                            if(bullet.name == "rocket") {
                                particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, EXPLOSIONPARTICLES, g))
                                explode(bullet, 60)
                            }
                            player.bullets.splice(num, 1)
                            break outerWallLoop;
                        }
                    }
                }
            }

            //checks bullet collision with crates
            for(let crate of crates) {
                if(bullet.checkCollision(crate)) {
                    crate.health -= bullet.damage
                    crate.vel.x += bullet.vel.x/4; crate.vel.y += bullet.vel.y/4
                    if(bullet.name == "rocket") {
                        particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, EXPLOSIONPARTICLES, g))
                        explode(bullet, 60)
                    }
                    player.bullets.splice(num, 1)
                }
            }

            //checks bullet collision with explosive barrels
            for(let i = 0; i < explosiveBarrels.length; i++) {
                let explosiveBarrel = explosiveBarrels[i]
                if(bullet.checkCollision(explosiveBarrel)) {
                    if(bullet.name == "rocket") {
                        particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, EXPLOSIONPARTICLES, g))
                        explode(bullet, 60)
                    }
                    explosiveBarrel.health = 0
                    explosiveBarrel.id = bullet.id
                    player.bullets.splice(num, 1)
                }
            }

            //checks collision with other players
            for(let hitPlayer of players) {
                if(hitPlayer.id != player.id) {
                    if(bullet.checkCollisionPlayer(hitPlayer)) {
                        hitPlayer.health -= bullet.damage
                        hitPlayer.vel.x += bullet.vel.x/7; hitPlayer.vel.y += bullet.vel.y/7
                        if(bullet.name == "rocket") {
                            particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, EXPLOSIONPARTICLES, g))
                            explode(bullet, 60)
                        } else {
                            if(hitPlayer.health <= 0) {
                                player.kills++;
                            }
                        }
                        player.bullets.splice(num, 1)
                    }
                }
            }
        }

        //checks grenade collision
        for(let num = 0; num < player.grenades.length; num++) {
            
            let grenade = player.grenades[num]
            
            //checks grenade collision with walls
            outerWallLoop:
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(grenade.checkCollision(map.map[i][j])) {
                            let collisionAngle = getCollisionAngle(map.map[i][j], grenade)
                            grenade.collisionReaction(collisionAngle)
                            break outerWallLoop;
                        }
                    }
                }
            }

            //checks grenade collision with crates
            for(let crate of crates) {
                if(grenade.checkCollision(crate)) {
                    crate.health -= grenade.damage
                    let collisionAngle = getCollisionAngle(crate, grenade)
                    grenade.collisionReaction(collisionAngle)
                }
            }

            //checks grenade collision with explosive barrels
            for(let explosiveBarrel of explosiveBarrels) {
                if(grenade.checkCollision(explosiveBarrel)) {
                    explosiveBarrel.health -= grenade.damage
                    let collisionAngle = getCollisionAngle(explosiveBarrel, grenade)
                    grenade.collisionReaction(collisionAngle)
                }
            }
        }
    }



    //draws everything
    if(frame%1 == 0) {

        g.clearRect(0,0,canvas.width,canvas.height);
        g.fillStyle = "orangered"
        g.fillRect(0, 0, canvas.width, canvas.height)

        map.draw()

        for(let item of items) {
            if(item.carrier == null) {
                item.draw()
            }
        }

        for(let player of players) {
            player.draw()
        }

        for(let crate of crates) {
            crate.draw()
        }

        for(let explosiveBarrel of explosiveBarrels) {
            explosiveBarrel.draw()
        }

        //displays pick up prompt
        if(players[0].heldGun.name == "pistol") {
            for(let item of items) {
                if(item.carrier == null) {
                    if(getDist(players[0], item) < 110) {
                        g.fillStyle = "white"
                        g.font = "32px consolas"
                        g.fillText("Press [E] to pick up", (canvas.width/2)-155, 100)
                    }
                }
            }
        }
        
        for(let effect of particleEffects) {
            effect.update(g)
        }

        for(let player of players) {
            player.drawHud()
        }

        //draw leaderboard
        if(showingLeaderboard) {
            g.fillStyle = "black"
            g.globalAlpha = 0.75
            g.fillRect(25, 25, canvas.width-50, canvas.height-50)

            g.fillStyle = "white"
            g.globalAlpha = 1.0
            g.font = "46px consolas"
            g.fillText("LEADERBOARD", (canvas.width/2)-150, 100)

            g.font = "26px consolas"
            g.fillText("KILLS", 600, 150)
            g.fillText("DEATHS", 800, 150)

            let y = 160
            for(let player of players) {
                g.fillStyle = "black"
                g.globalAlpha = 0.75
                g.fillRect(200, y, canvas.width-400, 50)

                g.fillStyle = player.hitColor
                g.globalAlpha = 1.0
                g.font = "24px consolas"
                g.fillText(BOTNAMES[player.id], 210, y+35)
                g.fillStyle = "white"
                g.globalAlpha = 0.3
                g.fillText(BOTNAMES[player.id], 210, y+35)

                g.fillStyle = "white"
                g.globalAlpha = 1.0
                g.fillText(player.kills+"", 600, y+35)
                g.fillText(player.deaths+"", 800, y+35)
                

                y+=60
            }



            g.globalAlpha = 1.0
        }

        //draws crosshair
        g.fillStyle = "white"
        g.drawImage(crosshairImage, cursorPos.x-12, cursorPos.y-12)

    }

    frame++


}

animate();