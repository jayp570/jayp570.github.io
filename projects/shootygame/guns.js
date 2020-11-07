class Gun extends Item {

    constructor(x, y, name) {
        super("assets/guns/"+name+".png", x, y)
        this.name = name
        this.carrier = null

        this.maxClip = GUNINFO[name].maxClip
        this.clip = this.maxClip
        this.reloadSpeed = GUNINFO[name].reloadSpeed;
        this.reloadStartFrame = -this.reloadSpeed 
        this.reloading = false
        this.rateOfFire = GUNINFO[name].rateOfFire
        this.lastShot = -this.rateOfFire
        this.canFire = true
        this.frame = 0

    }

    update(offsetX, offsetY) {
        super.update(offsetX, offsetY)
        if(this.carrier != null) {
            this.pos = this.carrier.pos
        }
        if(this.frame == this.reloadStartFrame + this.reloadSpeed) {
            this.clip = this.maxClip
        }
        if(this.frame-this.reloadStartFrame < this.reloadSpeed) {
            this.reloading = true
        } else {
            this.reloading = false
        }
        if(this.frame - this.lastShot > this.rateOfFire) {
            this.canFire = true
        } else {
            this.canFire = false
        }
    }
}

const GUNINFO = {
    "pistol": {
        reloadSpeed: 100,
        maxClip: 12,
        rateOfFire: 5
    },
    "shotgun": {
        reloadSpeed: 100,
        maxClip: 6,
        rateOfFire: 15
    },
    "rocketlauncher": {
        reloadSpeed: 150,
        maxClip: 4,
        rateOfFire: 25
    },
    "grenadelauncher": {
        reloadSpeed: 150,
        maxClip: 6,
        rateOfFire: 30
    },
}