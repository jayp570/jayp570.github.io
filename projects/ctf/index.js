let canvas = document.querySelector("canvas");

canvas.width = 1800;
canvas.height = 800;

function changeResolution() {
    if(canvas.width === 1800) {
        canvas.width = 2400;
    } else if(canvas.width === 2400) {
        canvas.width = 1800
    }
}

let g = canvas.getContext("2d");


const defaultACC = 0.9
const defaultFRIC = -0.1 //-0.05

let ACCELERATION = defaultACC
let FRICTION = defaultFRIC
let MOMENTUMLOSS = -1

const BULLETDAMAGE = 24;
const RELOADTIME = 12;
let ammoDrops = [];

let powerups = {
    "shotgun": new Powerup("shotgun"),
    "laser": new Powerup("laser"),
    "chaingun": new Powerup("chaingun")
}



function Bullet(playerX,playerY,mouseX,mouseY,color,id) {

    playerX+=16;
    playerY+=16;
    this.pos = {
        "x": playerX,
        "y": playerY
    }
    this.mousePos = {
        "x": mouseX,
        "y": mouseY
    }
    this.vel = {
        "x": null,
        "y": null
    }
    this.vel.x = this.mousePos.x-this.pos.x;
    this.vel.y = this.mousePos.y-this.pos.y;
    let dist = Math.sqrt(Math.pow(this.vel.x,2)+Math.pow(this.vel.y,2));
    this.vel.x = this.vel.x/dist;
    this.vel.y = this.vel.y/dist;
    this.vel.x*=20;
    this.vel.y*=20;
    this.visible = true;
    this.w = 7;
    this.h = 7;

    this.team = color;
    this.id = id;
    
    this.setVisible = function(bool) {
        this.visible = bool;
    }

    this.update = function() {
        if(this.visible) {
            this.pos.x+=this.vel.x; this.pos.y+=this.vel.y;

            if(this.pos.x+this.w > canvas.width) {this.visible = false}
            if(this.pos.y+this.h > canvas.height) {this.visible = false}
            if(this.pos.x < 0) {this.visible = false}
            if(this.pos.y < 0) {this.visible = false}

            g.fillStyle = "orange";
            g.beginPath();
            g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
            g.fill();
            g.globalAlpha = 0.7;
            g.fillStyle = this.team;
            g.beginPath();
            g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
            g.fill();
            g.globalAlpha = 0.4;
            g.fillStyle = "white";
            g.beginPath();
            g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
            g.fill();
            g.globalAlpha = 1.0;
        }
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

    this.getVisible = function() {
        return this.visible;
    }

    this.getPos = function() {
        return {"x": this.pos.x-this.w/2, "y": this.pos.y-this.h/2};
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

    this.getID = function() {
        return this.id;
    }

    this.getVel = function() {
        return this.vel;
    }

}

function Player(x, y, color) {

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

    this.fullHealth = 100;
    this.health = this.fullHealth;

    this.isCarrier = false;

    this.bullets = [];
    this.shooting = false;
    this.shootTimestamp = 0;
    this.laser = null;
    this.reloadTime = RELOADTIME;

    this.fullDashTimer = 32;
    this.dashTimer = 32;

    this.id = null;

    this.tick = 0;

    this.powerups = {};
    for(let k in powerups) {
        this.powerups[k] = false;
    }

    this.indicatorImage = new Image();
    this.indicatorImage.src = "images/indicator.png";

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

    this.setShooting = function(bool) {
        this.shooting = bool;
    }

    this.setShootTimestamp = function(num) {
        this.shootTimestamp = num;
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

    this.takeDamage = function(num) {
        this.health-=num;
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

    this.heal = function(num) {
        this.health+=num;
        if(this.health >= this.fullHealth) {
            this.health = this.fullHealth;
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
        g.drawImage(this.indicatorImage,this.pos.x,this.pos.y-this.h-10);
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
            g.arc(this.pos.x+x,this.pos.y+10+this.h,2.5,0,2*Math.PI,false);
            g.fill();
            x = i*7.5;
        }
        */
        g.fillStyle = "#62e3fc";
        g.fillRect(this.pos.x-15,this.pos.y+(this.w-this.dashTimer),10,this.dashTimer);
        g.beginPath();

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
        return null;
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

    this.getShooting = function() {
        return this.shooting;
    }

    this.getLaser = function() {
        return this.laser;
    }

    this.getReloadTime = function() {
        return this.reloadTime;
    }

}

function Flag(base) {

    let basePos = base.getPos();
    this.spawnPos = {
        "x": basePos.x+base.getW()/2,
        "y": basePos.y+base.getH()/2
    }
    this.pos = {
        "x": this.spawnPos.x,
        "y": this.spawnPos.y
    }
    this.w = 25;
    this.h = 25;
    this.team = base.getTeam();
    this.carrier = null;
    this.fullTimer = 225;
    this.timer = this.fullTimer;
    this.depleting = false;

    this.update = function() {
        let basePos = base.getPos();
        this.spawnPos = {
            "x": basePos.x+base.getW()/2,
            "y": basePos.y+base.getH()/2
        }
        if(!this.depleting && this.carrier === null) {
            this.pos.x = this.spawnPos.x;
            this.pos.y = this.spawnPos.y;
        }

        if(this.carrier != null) {
            this.pos.x = this.carrier.pos.x-5;
            this.pos.y = this.carrier.pos.y-5;
            if(this.carrier.getHealth() <= 0) {
                this.depleting = true;
                this.carrier.setIsCarrier(false);
                this.carrier = null;
            }
        }

        if(this.depleting) {
            this.timer--;
        }
        if(this.timer == 0) {
            this.respawn();
        }

        g.globalAlpha = this.timer/this.fullTimer;
        g.fillStyle = "white";
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2+3,0,2*Math.PI,false);
        g.fill();
        g.fillStyle = this.team;
        g.globalAlpha = 1.0
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
        g.fill();
        g.shadowBlur = 0;
    }

    this.setCarrier = function(player) {
        this.carrier = player;
        this.carrier.setIsCarrier(true);
        this.depleting = false;
        this.timer = this.fullTimer;
    }

    this.respawn = function() {
        if(this.carrier != null) {
            this.carrier.setIsCarrier(false);
            this.carrier = null;
        }
        this.pos.x = this.spawnPos.x;
        this.pos.y = this.spawnPos.y;
        this.depleting = false;
        this.timer = this.fullTimer;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getPos = function() {
        return {"x": this.pos.x-this.w/2, "y": this.pos.y-this.h/2};
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getCarrier = function() {
        return this.carrier;
    }

}

function Base(w,h,color) {

    this.pos = {
        "x": canvas.width-150,
        "y": canvas.height/2-75
    }
    if(color === "red") {
        this.pos = {
            "x": 0,
            "y": canvas.height/2-75
        }
    }
    this.w = w;
    this.h = h;
    this.team = color;

    this.update = function(g) {
        g.fillStyle = this.team;
        g.globalAlpha = 0.5;
        g.fillRect(this.pos.x,this.pos.y,this.w,this.h);
        g.globalAlpha = 1.0;
        this.pos = {
            "x": canvas.width-150,
            "y": canvas.height/2-75
        }
        if(this.team === "red") {
            this.pos = {
                "x": 0,
                "y": canvas.height/2-75
            }
        }
    }

    this.getTeam = function() {
        return this.team;
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
}

function HealingStation(color) {

    this.pos = {
        "x": 50,
        "y": 50
    }
    if(color === "blue") {
        this.pos = {
            "x": canvas.width-50,
            "y": canvas.height-50
        }
    }
    this.team = color;
    this.w = 40;
    this.h = 40;

    this.update = function(g) {
        this.pos = {
            "x": 50,
            "y": 50
        }
        if(color === "blue") {
            this.pos = {
                "x": canvas.width-50,
                "y": canvas.height-50
            }
        }

        g.fillStyle = this.team;
        g.fillRect(this.pos.x-this.w/4, this.pos.y-this.w/2, this.w/2, this.w);
        g.fillRect(this.pos.x-this.w/2, this.pos.y-this.w/4, this.w, this.w/2);
        g.globalAlpha = 0.5;
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
        g.fill();
        g.globalAlpha = 1.0;
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

    this.getID = function() {
        return null;
    }

}

function AmmoDrop(x, y) {

    this.pos = {
        "x": x,
        "y": y
    }
    this.w = 10;
    this.h = 10;

    this.timer = 100;

    this.update = function() {
        g.fillStyle = "orange";
        g.globalAlpha = this.timer/100;
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
        g.fill();
        this.timer--;
        g.globalAlpha = 1.0;
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

    this.getTimer = function() {
        return this.timer;
    }

}



let activePowerup = powerups.chaingun;

let bases = {
    "red": new Base(150, 150, "red"),
    "blue": new Base(150, 150, "blue")
}

let flags = {
    "red": new Flag(bases.red),
    "blue": new Flag(bases.blue)
}

let healingStations = {
    "red": new HealingStation("red"),
    "blue": new HealingStation("blue")
}

let score = {
    "red": 0,
    "blue": 0
}

let players = {
    "player": [/*new Player("red")*/],
    "red": [],
    "blue": []
}
let count = 0
let redXPos = [0, 40, 80];
let redYPos = 767;
for(let i = 0; i < 2; i++) {
    if(i != 0) {
        players.red.push(new Bot(redXPos[i%3], 767, "red", flags, bases, healingStations, count))
    } else {
        players.player.push(new Player(redXPos[i%3], 767, "red"));
    }
    count++;
}
let blueXPos = [canvas.width-33, canvas.width-73, canvas.width-40-73];
let blueYPos = [0, 0, 0];
for(let i = 1; i < 3; i++) {
    players.blue.push(new Bot(blueXPos[i%3], 0, "blue", flags, bases, healingStations, count))
    count++;
}
console.log(players.red)
console.log(players.blue)
for(let i = 0; i < players.red.length; i++) {
    players.red[i].setPlayers(players);
}
for(let i = 0; i < players.blue.length; i++) {
    players.blue[i].setPlayers(players);
}
//console.log(players.blue[0].getPlayers());

let showControls = false;

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
window.addEventListener("mousedown", mouseDownHandler, false);
window.addEventListener("mouseup", mouseUpHandler, false);
window.addEventListener("mousemove", mouseMoveHandler, false);
function keyDownHandler(e) {
    let code = e.keyCode;
    players.player[0].setDirection(code,true);
    if(code === 16) {
        players.player[0].takeDamage(1000);
    }
    if(code === 32) {
        players.player[0].dash();
    }
    if(code === 70) {
        showControls = true;
    }
}
function keyUpHandler(e) {
    let code = e.keyCode;
    players.player[0].setDirection(code,false);
    if(code === 70) {
        showControls = false;
    }
}
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    players.player[0].setShooting(true);
}
function mouseUpHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    players.player[0].setShooting(false);
}

let playerShootTarget = {
    "x": null,
    "y": null
}

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    playerShootTarget.x = mouseX;
    playerShootTarget.y = mouseY;
}


let win = false;
let winningTeam = null;
let winScreenTick = 0;

function animate() {

    requestAnimationFrame(animate);

    if(win === false) {

        g.clearRect(0,0,canvas.width,canvas.height);

        for(let i in score) {
            if(score[i] >= 5) {
                winningTeam = i;
                win = true;
            }
        }

        g.fillStyle = "yellow";
        g.fillRect((canvas.width/2)-5,0,5,canvas.height);

        g.fillStyle = "red";
        g.textAlign = "center";
        g.font = "50px Tahoma";
        g.fillText(score.red,canvas.width/2-60,canvas.height/2-25);
        g.fillStyle = "blue";
        g.fillText(score.blue,canvas.width/2+55,canvas.height/2-25);

        FRICTION = defaultFRIC
        ACCELERATION = defaultACC

        healingStations.red.update(g);
        healingStations.blue.update(g);

        bases.red.update(g);
        bases.blue.update(g);
        for(let i = 0; i < ammoDrops.length; i++) {
            ammoDrops[i].update();
        }

        if(activePowerup != null) {
            activePowerup.update(g);
        } 
        if(activePowerup === null) {
            let powerupKeys = Object.keys(powerups);
            let choice = Math.floor(Math.random()*powerupKeys.length);
            activePowerup = powerups[powerupKeys[choice]];
        }

        flags.red.update(g);
        flags.blue.update(g);

        if(!players.player[0].powerups.chaingun) {
            players.player[0].setReloadTime(RELOADTIME);
        }
        if(players.player[0].getShooting()) {
            let yourPlayer = players.player[0];
            if(yourPlayer.powerups.laser === false) {
                if(yourPlayer.shootTimestamp+yourPlayer.getReloadTime() <= yourPlayer.tick) {
                    players.player[0].shoot(playerShootTarget.x, playerShootTarget.y);
                    yourPlayer.shootTimestamp = yourPlayer.tick;
                    if(players.player[0].powerups.chaingun) {
                        players.player[0].setReloadTime(players.player[0].getReloadTime()/1.04);
                    }
                }
            } else {
                g.beginPath();
                g.strokeStyle = 'white';
                let x = yourPlayer.getPos().x+yourPlayer.getW()/2;
                let y = yourPlayer.getPos().y+yourPlayer.getH()/2;
                let xDist = playerShootTarget.x-x;
                let yDist = playerShootTarget.y-y;
                let dist = Math.sqrt(Math.pow(xDist,2)+Math.pow(yDist,2));
                let increment = {"x": xDist/dist, "y": yDist/dist};
                let start = {"x": x, "y": y};
                let end = {"x": playerShootTarget.x, "y": playerShootTarget.y};
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
                g.shadowColor = yourPlayer.getTeam();
                g.moveTo(x, y);
                g.lineTo(end.x, end.y);
                g.lineWidth = 5;
                g.lineCap = "round";
                g.stroke();
                g.shadowBlur = 0;
                let laserCoords = [];
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
                    "team": yourPlayer.getTeam(),
                    "coords": laserCoords,
                    "id": yourPlayer.getID()
                }
                yourPlayer.setLaser(playerLaser);
            }
        }

        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                players[i][j].update(g);
            }
        }

        if(showControls) {
            g.globalAlpha = 0.5;
            g.fillStyle = "black";
            g.fillRect(50,50,canvas.width-100,canvas.height-100);
            g.globalAlpha = 1.0;
            g.fillStyle = "white";
            g.textAlign = "center";
            g.font = "30px Tahoma";
            let verticalOffset = 160;
            g.fillText("W - UP", canvas.width/2, verticalOffset+100);
            g.fillText("A - LEFT", canvas.width/2, verticalOffset+140);
            g.fillText("S - DOWN", canvas.width/2, verticalOffset+180);
            g.fillText("D - RIGHT", canvas.width/2, verticalOffset+220);
            g.fillText("LEFT CLICK - SHOOTS TOWARDS CURSOR", canvas.width/2, verticalOffset+260);
            g.fillText("SPACE - DASH", canvas.width/2, verticalOffset+300);
            g.fillText("F - CONTROLS", canvas.width/2, verticalOffset+340);
        }


        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                for(let base in bases) {
                    if(player.getTeam() === bases[base].getTeam()) {
                        if(player.checkCollision(bases[base])) {
                            player.takeDamage(1);
                            if(player.getIsCarrier() == true) {
                                let playersTeam = player.getTeam();
                                let enemyTeam;
                                for(let k in flags) {
                                    if(k != playersTeam) {
                                        enemyTeam = k;
                                    }
                                }
                                score[playersTeam]+=1;
                                flags[enemyTeam].respawn();

                            }
                            break;
                        }
                    }
                }
            }
        }

        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                for(let flag in flags) {
                    if(player.checkCollision(flags[flag]) && player.getHealth() > 0 &&
                    flags[flag].getCarrier() === null) {
                        if(player.getTeam() != flags[flag].getTeam()) {
                            flags[flag].setCarrier(player);
                            break;
                    }
                    }
                }
            }
        }

        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                for(let i in healingStations) {
                    if(player.getTeam() === healingStations[i].getTeam()) {
                        if(player.checkCollision(healingStations[i])) {
                            player.heal(2);
                        }
                    }
                }
            }
        }

        bullets = [];
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                bullets.push(player.getBullets())
            }
        }
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                for(let k = 0; k < bullets.length; k++) {
                    for(let l = 0; l < bullets[k].length; l++) {
                        let bullet = bullets[k][l];
                        if(player.checkCollision(bullet) && player.getID() != bullet.getID() && player.getTeam() != bullet.getTeam()) {
                            player.takeDamage(BULLETDAMAGE);
                            player.vel.x+=bullet.getVel().x/2;
                            player.vel.y+=bullet.getVel().y/2;
                            bullet.setVisible(false);
                        }
                    }
                }
            }
        }

        let lasers = [];
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                if(player.getLaser() != null) {
                    lasers.push(player.getLaser())
                }
            }
        }
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                for(let k = 0; k < lasers.length; k++) {
                    for(let l = 0; l < lasers[k].coords.length; l++) {
                        let laserCoords = lasers[k].coords[l];   
                        if(player.checkCollisionNonObject(laserCoords.x, laserCoords.y, 1, 1) && lasers[k].team != player.getTeam()) {
                            player.takeDamage(0.1);
                            player.setVel({x: player.getVel().x/1.005, y: player.getVel().y/1.005});
                        }    
                    }
                }
            }
        }
        if(players.player[0].getShooting() === false) {
            players.player[0].setLaser(null);
        }

        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                for(let k = 0; k < ammoDrops.length; k++) {
                    let ammoDrop = ammoDrops[k];
                    if(player.checkCollision(ammoDrop)) {
                        if(player.pickUpAmmo()) {
                            ammoDrops.splice(k,1);
                        }
                    }
                }
            }
        }

        if(activePowerup != null) {
            for(let i in players) {
                for(let j = 0; j < players[i].length; j++) {
                    let player = players[i][j];
                    if(player.checkCollision(activePowerup)) {
                        player.pickUpPowerup(activePowerup.name);
                        activePowerup = null;
                        break;
                    }
                }
            }
        }

        for(let i = 0; i < ammoDrops.length; i++) {
            if(ammoDrops[i].getTimer() < 0) {
                ammoDrops.splice(i,1);
            }
        }

        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player1 = players[i][j];
                for(let k in players) {
                    for(let l = 0; l < players[k].length; l++) {
                        let player2 = players[k][l];
                        if(player1.checkCollision(player2) && player1.getID() != player2.getID()) {
                            if(player1.getTeam() != player2.getTeam()) {
                                player2.vel.x = player1.vel.x*-1.01;
                                player2.vel.y = player1.vel.y*-1.01;
                                player1.vel.x*=-1.01;
                                player1.vel.y*=-1.01;
                            }
                        }
                    }
                }
            }
        }
    }
    if(win) {
        g.globalAlpha = winScreenTick/500;
        g.fillStyle = "black";
        g.fillRect(0,0,canvas.width,canvas.height);
        if(winScreenTick/500 > 0.2) {
            g.globalAlpha = 1.0;
            g.fillStyle = "white";
            g.textAlign = "center";
            g.font = "60px Tahoma";
            g.fillText(winningTeam.toUpperCase()+" WINS", canvas.width/2, canvas.height/2);
        }
        winScreenTick++;
    }
}


animate();


/*
TO DO
shield powerup
reduce chaingun bullet damage
grappling hook powerup
fix blue spawn resolution change
set cap for chaingun rate of fire
add leaderboard + stats
add killfeed
*/