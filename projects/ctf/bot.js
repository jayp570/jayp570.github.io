
function Bot(x, y, color, flags, bases, healingStations, ID) {

    this.w = 32;
    this.h = 32;
    this.spawnPos = {
        "x": x,
        "y": y
    }
    this.pos = {
        "x": this.spawnPos.x,
        "y": this.spawnPos.y
    }
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.leftIn = false;
    this.rightIn = false;
    this.upIn = false;
    this.downIn = false;

    this.team = color;
    this.enemyTeam = null;

    this.fullHealth = 100;
    this.health = this.fullHealth;

    this.isCarrier = false;

    this.bullets = [];
    this.shooting = false;
    this.shootTimestamp = 0;
    this.tick = 0;
    this.laser = null;
    this.reloadTime = RELOADTIME;

    this.fullDashTimer = 32;
    this.dashTimer = 32;

    this.flags = flags;
    this.teamBase = bases[this.team];
    this.healingStations = healingStations;
    this.healing = false;
    for(let i in flags) {
        if(i != this.team) {
            this.enemyTeam = i;
            break;
        }
    }
    this.players = {
        "red": [],
        "blue": []
    }
    this.id = ID;

    this.powerups = {};
    for(let k in powerups) {
        this.powerups[k] = false;
    }

    this.setPlayers = function(players) {
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                if(player.getID() != this.id) {
                    this.players[player.getTeam()].push(player);
                }
            }
        }
    }

    this.setDirection = function(code,bool) {
        switch(code) {
            case 65: this.leftIn = bool; break;
            case 87: this.upIn = bool; break;
            case 68: this.rightIn = bool; break;
            case 83: this.downIn = bool; break;
            default: ;
        }
    }

    this.setIsCarrier = function(bool) {
        this.isCarrier = bool;
    }

    this.setVel = function(vel) {
        this.vel = vel;
    }

    this.setLaser = function(laser) {
        this.laser = laser;
    }

    this.setReloadTime = function(num) {
        this.reloadTime = num;
    }

    this.checkCollision = function(object) {
        let bX = object.getPos().x;
        let bY = object.getPos().y;
        let bW = object.getW();
        let bH = object.getH();
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.checkCollisionNonObject = function(bX, bY, bW, bH) {
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.takeDamage = function(num) {
        this.health-=num;
    }

    this.heal = function(num) {
        this.health+=num;
        if(this.health >= this.fullHealth) {
            this.health = this.fullHealth;
            this.healing = false;
        }
    }

    this.shoot = function(mouseX,mouseY) {
        let x = this.pos.x+this.w/2;
        let y = this.pos.y+this.h/2;
        if(this.powerups.laser === false) {
            this.bullets.push(new Bullet(x,y,mouseX,mouseY,this.team,this.id));
        }
        if(this.powerups.shotgun) {
            let trshld = 100;
            let offset = {
                one: {
                    x: Math.random()*(trshld-(-trshld))+(-trshld),
                    y: Math.random()*(trshld-(-trshld))+(-trshld),
                },
                two: {
                    x: Math.random()*(trshld-(-trshld))+(-trshld),
                    y: Math.random()*(trshld-(-trshld))+(-trshld),
                }
            }
            this.bullets.push(new Bullet(x, y, mouseX+offset.one.x, mouseY+offset.one.y, this.team, this.id));
            this.bullets.push(new Bullet(x, y, mouseX+offset.two.x, mouseY+offset.two.y, this.team, this.id));
            this.vel.x-=this.bullets[this.bullets.length-1].getVel().x/2;
            this.vel.y-=this.bullets[this.bullets.length-1].getVel().y/2;
        }
        if(this.powerups.chaingun) {
            let trshld = 20;
            offset = [];
            for(let i = 0; i < 4; i++) {
                offset.push(
                     {
                        x: Math.random()*(trshld-(-trshld))+(-trshld),
                        y: Math.random()*(trshld-(-trshld))+(-trshld),
                     }
                );
            }
            for(let i = 0; i < offset.length; i++) {
                this.bullets.push(new Bullet(x+offset[i].x, y+offset[i].y, mouseX+offset[i].x, mouseY+offset[i].y, this.team, this.id));
            }
            this.vel.x-=this.bullets[this.bullets.length-1].getVel().x/3;
            this.vel.y-=this.bullets[this.bullets.length-1].getVel().y/3;
        }
    }

    this.fireLaser = function(mouseX, mouseY) {
        g.beginPath();
        g.strokeStyle = 'white';
        let x = this.pos.x+this.w/2;
        let y = this.pos.y+this.h/2;
        let xDist = mouseX-x;
        let yDist = mouseY-y;
        let dist = Math.sqrt(Math.pow(xDist,2)+Math.pow(yDist,2));
        let increment = {"x": xDist/dist, "y": yDist/dist};
        let laserCoords = [];
        let start = {"x": x, "y": y};
        let end = {"x": mouseX, "y": mouseY};
        let hitBounds = false;
        while(hitBounds === false) {
            end.x+=increment.x; end.y+=increment.y;
            if(end.x > canvas.width || end.x < 0 || end.y < 0 || end.y > canvas.height) {
                hitBounds = true;
            }
        }
        g.shadowBlur = 10;
        g.shadowOffsetX = 0;
        g.shadowOffsetY = 0;
        g.shadowColor = this.team;
        g.moveTo(x, y);
        g.lineTo(end.x, end.y);
        g.lineWidth = 5;
        g.lineCap = "round";
        g.stroke();
        g.shadowBlur = 0;
        while(start.x <= end.x && start.y <= end.y) {
            laserCoords.push({"x": start.x, "y": start.y});
            start.x+=increment.x; start.y+=increment.y;
        }
        start = {"x": x, "y": y};
        while(start.x <= end.x && start.y >= end.y) {
            laserCoords.push({"x": start.x, "y": start.y});
            start.x+=increment.x; start.y+=increment.y;
        }
        start = {"x": x, "y": y};
        while(start.x >= end.x && start.y <= end.y) {
            laserCoords.push({"x": start.x, "y": start.y});
            start.x+=increment.x; start.y+=increment.y;
        }
        start = {"x": x, "y": y};
        while(start.x >= end.x && start.y >= end.y) {
            laserCoords.push({"x": start.x, "y": start.y});
            start.x+=increment.x; start.y+=increment.y;
        }
        let playerLaser = {
            "team": this.getTeam(),
            "coords": laserCoords,
            "id": this.getID()
        }
        this.setLaser(playerLaser);
    }

    this.dash = function() {
        if(this.dashTimer >= this.fullDashTimer && this.isCarrier === false) {
            if(this.leftIn) {this.vel.x-=10}
            if(this.rightIn) {this.vel.x+=10}
            if(this.upIn) {this.vel.y-=10}
            if(this.downIn) {this.vel.y+=10}
            this.dashTimer = 0;
        }
    }

    this.pickUpAmmo = function() {
        
    }

    this.findObject = function(flag) {
        this.leftIn = false;
        this.rightIn = false;
        this.upIn = false;
        this.downIn = false;
        let flagPos = {
            "x": flag.getPos().x,
            "y": flag.getPos().y
        }
        let xDist = flagPos.x-this.pos.x;
        let yDist = flagPos.y-this.pos.y;
        if(xDist < 0) {
            this.leftIn = true;
        }
        if(xDist > 0) {
            this.rightIn = true;
        }
        if(yDist < 0) {
            this.upIn = true;
        }
        if(yDist > 0) {
            this.downIn = true;
        }
    }

    this.findClosestPlayer = function(team) {
        let centerPos = {"x": this.pos.x+this.w/2, "y": this.pos.y+this.h/2};
        let minDistPlayer = {"dist": 100000, "player": null};
        for(let i in this.players) {
            for(let j = 0; j < this.players[i].length; j++) {
                let player = this.players[i][j];
                if(player.getTeam() === team) {
                    let playerCenterPos = {
                        "x": player.getPos().x+player.getW()/2,
                        "y": player.getPos().y+player.getH()/2
                    }
                    let dist = Math.sqrt(Math.pow(centerPos.x-playerCenterPos.x,2)+Math.pow(centerPos.y-playerCenterPos.y,2));
                    if(dist < minDistPlayer.dist) {
                        minDistPlayer.dist = dist;
                        minDistPlayer.player = player;
                    }
                }    
            }
        }
        return minDistPlayer;
    }

    this.avoid = function(team) {
        let distThreshhold = 300;
        let minDistPlayer = this.findClosestPlayer(team);
        if(minDistPlayer.dist < distThreshhold && minDistPlayer.player != null) {
            let directions = minDistPlayer.player.getDirections();
            
            if(directions.leftIn) {
                this.leftIn = false;
                this.rightIn = true;
            } else if(directions.rightIn) {
                this.rightIn = false;
                this.leftIn = true;
            }
            if(directions.upIn) {
                this.upIn = false;
                this.downIn = true;
            } else if(directions.downIn) {
                this.downIn = false;
                this.upIn = false;
            }
        }
    }

    this.checkFlagCarried = function(flag) {
        if(flag.getCarrier() != null) {
            return flag.getCarrier();
        }
        return null;
    }

    this.pickUpPowerup = function(powerupName) {
        for(let k in this.powerups) {
            this.powerups[k] = false;
        }
        this.powerups[powerupName] = true;
    }

    this.hasPowerup = function() {
        for(let k in this.powerups) {
            if(this.powerups[k]) {
                return true;
            }
        }
        return false;
    }

    this.respawn = function() {
        ammoDrops.push(new AmmoDrop(this.pos.x, this.pos.y));
        this.pos.x = this.spawnPos.x; 
        this.pos.y = this.spawnPos.y;
        this.health = this.fullHealth;
        this.dashTimer = this.fullDashTimer;
        this.healing = false;
        for(let k in this.powerups) {
            this.powerups[k] = false;
        }
    }

    this.update = function(g) {
        ACCELERATION = defaultACC;
        if(this.isCarrier) {
            ACCELERATION = ACCELERATION/2;
        }
        this.acc.x = 0; this.acc.y = 0;
        this.w = 32; this.h = 32;
        if(this.shooting === false) {
            this.laser = null;
        }

        //behavior
        let shootingTarget = {"x": null, "y": null};       
        let shootChance = Math.round(Math.random()*100+1); 
        if(this.isCarrier === false) {
            let closestEnemy = this.findClosestPlayer(this.enemyTeam).player;
            shootingTarget.x = closestEnemy.getPos().x+closestEnemy.getW()/2;
            shootingTarget.y = closestEnemy.getPos().y;
            this.findObject(this.flags[this.enemyTeam]);
            if(this.health < 25) {
                this.healing = true;
            }
            if(this.checkFlagCarried(this.flags[this.enemyTeam]) != null) {
                this.findObject(closestEnemy);
                shootingTarget.x = closestEnemy.getPos().x+closestEnemy.getW()/2;
                shootingTarget.y = closestEnemy.getPos().y+closestEnemy.getH()/2;
            }
            if(this.checkFlagCarried(this.flags[this.team]) != null) {
                let enemyFlagCarrier = this.checkFlagCarried(this.flags[this.team]);
                this.findObject(enemyFlagCarrier);
                shootingTarget.x = enemyFlagCarrier.getPos().x+enemyFlagCarrier.getW()/2;
                shootingTarget.y = enemyFlagCarrier.getPos().y+enemyFlagCarrier.getH()/2;
            }
            let dashChance = Math.round(Math.random()*51+1);
            if(dashChance === 50) {
                this.dash();
            }
            if(shootChance === 50) {
                this.shooting = !this.shooting;
            }
        } 
        if(this.isCarrier) {
            this.findObject(this.teamBase);
            let closestEnemy = this.findClosestPlayer(this.enemyTeam).player;
            if(shootChance === 50) {
                this.shooting = !this.shooting;
            }
            shootingTarget.x = closestEnemy.getPos().x+closestEnemy.getW()/2;
            shootingTarget.y = closestEnemy.getPos().y+closestEnemy.getH()/2;
            this.avoid(this.enemyTeam);
        }
        if(this.healing) {
            this.findObject(this.healingStations[this.team]);
        }
        if(!this.powerups.chaingun) {
            this.setReloadTime(RELOADTIME);
        }
        if(this.shooting) {
            if(this.powerups.laser === false) {
                if(this.shootTimestamp+this.reloadTime <= this.tick) {
                    this.shoot(shootingTarget.x, shootingTarget.y);
                    this.shootTimestamp = this.tick;
                    if(this.powerups.chaingun) {
                        this.setReloadTime(this.reloadTime/1.04);
                    }
                }
            } else {
                this.fireLaser(shootingTarget.x, shootingTarget.y);
            }
        }
        
        if(this.leftIn) {
            this.acc.x = -ACCELERATION;
        }
        if(this.rightIn) {
            this.acc.x = ACCELERATION;
        }
        if(this.upIn) {
            this.acc.y = -ACCELERATION;
        }
        if(this.downIn) {
            this.acc.y = ACCELERATION;
        }
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        if(this.pos.x+this.w > canvas.width) {
            this.pos.x = canvas.width-this.w;
            this.vel.x*=MOMENTUMLOSS;
        }
        if(this.pos.y+this.h > canvas.height) {
            this.pos.y = canvas.height-this.h;
            this.vel.y*=MOMENTUMLOSS;
        }
        if(this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x*=MOMENTUMLOSS;
        }
        if(this.pos.y < 0) {
            this.pos.y = 0;
            this.vel.y*=MOMENTUMLOSS;
        }


        if(!this.shooting && this.powerups.chaingun) {
            this.reloadTime = RELOADTIME;
        }
        for(let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
        }
        for(let i = 0; i < this.bullets.length; i++) {
            if(this.bullets[i].getVisible() === false) {
                this.bullets.splice(i,1);
            }
        }

        if(this.health <= 0) {
            this.respawn();
        }

        if(this.dashTimer < this.fullDashTimer) {
            this.dashTimer+=0.5;
        }

        if(this.hasPowerup()) {
            g.shadowBlur = 10;
            g.shadowOffsetX = 0;
            g.shadowOffsetY = 0;
            g.shadowColor = "white";
        }
        g.fillStyle = this.team;
        g.fillRect(this.pos.x,this.pos.y,this.w,this.h);
        g.shadowBlur = 0;
        g.fillStyle = "red";
        g.fillRect(this.pos.x,this.pos.y-15,this.fullHealth/3,10);
        g.fillStyle = "green";
        g.fillRect(this.pos.x,this.pos.y-15,this.health/3,10);
        g.fillStyle = "orange";
        /*
        let x = 0
        for(let i = 1; i <= this.bulletsNum; i++) {
            g.beginPath();
            g.arc(this.pos.x+x,this.pos.y+10+this.h,5,0,2*Math.PI,false);
            g.fill();
            x = i*15;
        }
        */
        g.fillStyle = "white";
        g.textAlign = "center";
        g.font = "20px Tahoma";
        g.fillText(this.id,this.pos.x+this.w/2,this.pos.y+this.h/2+8);
        g.fillStyle = "#62e3fc";
        g.fillRect(this.pos.x-15,this.pos.y+(this.w-this.dashTimer),10,this.dashTimer)

        this.tick++;
    }

    this.getVel = function() {
        return this.vel;
    }

    this.getPos = function() {
        return this.pos;
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getHealth = function() {
        return this.health;
    }

    this.getIsCarrier = function() {
        return this.isCarrier;
    }

    this.getID = function() {
        return this.id;
    }

    this.getPlayers = function() {
        return this.players;
    }

    this.getBullets = function() {
        return this.bullets;
    }

    this.getDirections = function() {
        let directions = {
            "leftIn": this.leftIn,
            "rightIn": this.rightIn,
            "upIn": this.upIn,
            "downIn": this.downIn
        }
        return directions;
    }

    this.getLaser = function() {
        return this.laser;
    }

    this.getReloadTime = function() {
        return this.reloadTime;
    }

}