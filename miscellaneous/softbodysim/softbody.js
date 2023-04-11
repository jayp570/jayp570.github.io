function Point(x, y, velX, velY, mass, fixed, id) {

    this.pos = new Vector2(x, y)
    this.vel = new Vector2(velX, velY)
    this.acc = new Vector2(0, 0)
    this.forces = []
    this.mass = mass

    this.id = id

    this.fixed = fixed

    this.path = []
    this.pathColor = `hsl(${Math.random()*360}, 100%, 50%)`

    this.color = "white"

    this.addForce = function(force) {
        this.forces.push(force)
    }

    this.updatePosition = function() {

        //update forces
        let fNet = new Vector2(0, 0)
        for(let force of this.forces) {
            fNet = Vector2.add(fNet, force)
        }
        this.acc = Vector2.divide(fNet, this.mass)

        //update quantities
        if(!this.fixed && !this.selected) {
            this.vel = Vector2.add(this.vel, Vector2.multiply(this.acc, dt))
            this.pos = Vector2.add(this.pos, Vector2.multiply(this.vel, dt))
            this.acc = new Vector2(0, 0)
        }
        this.forces = [] //all forces are instantaneous

        if(time%dt == 0) {
            this.path.push(JSON.parse(JSON.stringify(this.pos)))
        }
        
    }

    this.renderPath = function() {
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.strokeStyle = this.pathColor
        let pathTime = 500
        for(let i = this.path.length-1; i > (this.path.length-pathTime > 0 ? this.path.length-pathTime : 0); i--) {
            ctx.moveTo(this.path[i].x, this.path[i].y)
            ctx.lineTo(this.path[i-1].x, this.path[i-1].y)
        }
        ctx.stroke()
    }

    this.render = function() {

        if(displayPath) {
            this.renderPath()
        }

        ctx.fillStyle = this.fixed ? "yellow" : "white"
        ctx.fillStyle = this.color
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, pointSize, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        if(this.selected) {
            ctx.globalAlpha = 0.5
            ctx.fillStyle = "white"
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, pointSize, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1
        }
        ctx.fillStyle = this.fixed ? "yellow" : "white"
        //ctx.fillText(`pos: ${this.pos.x}, ${this.pos.y}`, 10, 10+this.id*10)

    }

}



function SoftBodyMatrix(x, y, w, h, mass, springLength) {

    this.points = new Map()
    let n = 0
    for(let r = 0; r < h; r++) {
        for(let c = 0; c < w; c++) {
            let point = new Point(
                x+c*springLength,
                y+r*springLength,
                0,
                0,
                mass/(w*h),
                false,
                n
            )
            this.points.set(n, point)
            n++
        }
    }
    this.springLength = springLength
    // this.points.get(24).fixed = true
    // this.points.get(23).fixed = true
    // this.points.get(22).fixed = true
    // this.points.get(21).fixed = true
    // this.points.get(20).fixed = true
    //this.points.get(4).vel.x = 10
    this.mesh = jelloMode
    this.color = `hsl(${Math.random()*360}, 100%, 50%)`

    this.springForce = function(point1, point2) {
        let dist = getDist(point1, point2)
        let dx = point1.pos.x - point2.pos.x
        let dy = point1.pos.y - point2.pos.y
        let springForce = k * (this.springLength - dist) //hookes law: F_spring = -k * distance spring has stretched
        return new Vector2(springForce*(dx/dist), springForce*(dy/dist))
    }

    this.updatePhysics = function() {
        //apply gravity
        for(let point of this.points.values()) {
            point.addForce(new Vector2(0, point.mass*g))
        }

        //apply all the spring forces
        //apply spring force (point2 is left of point1)
        for(let i = 0; i < w*h; i++) {
            if(i%w != 0) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i-1)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is right of point1)
        for(let i = 0; i < w*h; i++) {
            if(i%w != w-1) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i+1)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is above point1)
        for(let i = 0; i < w*h; i++) {
            if(i > w-1) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i-w)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is below point1)
        for(let i = 0; i < w*h; i++) {
            if(i < w*h-w) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i+w)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is top left to point1)
        for(let i = 0; i < w*h; i++) {
            if(i%w != 0 && i > w-1) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i-w-1)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is top right to point1)
        for(let i = 0; i < w*h; i++) {
            if(i%w != w-1 && i > w-1) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i-w+1)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is bottom left to point1)
        for(let i = 0; i < w*h; i++) {
            if(i%w != 0 && i < w*h-w) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i+w-1)
                point1.addForce(this.springForce(point1, point2))
            }
        }
        //apply spring force (point2 is bottom right to point1)
        for(let i = 0; i < w*h; i++) {
            if(i%w != w-1 && i < w*h-w) {
                let point1 = this.points.get(i)
                let point2 = this.points.get(i+w+1)
                point1.addForce(this.springForce(point1, point2))
            }
        }

        //apply damping force
        for(let point of this.points.values()) {
            let v = point.vel.getMagnitude()
            let dampingForce = -1*R*v*v //drag equation: F_d = 0.5 * rho * C_d * A * v^2
            if(v != 0) {
                point.addForce(new Vector2(dampingForce*(point.vel.x/v), dampingForce*(point.vel.y/v)))
            }
        }

        //push points away from each other if they are touching (prevents collapsing)
        for(let point1 of this.points.values()) {
            for(let point2 of this.points.values()) {
                if(point1.id != point2.id) {
                    let dist = getDist(point1, point2)
                    if(dist < pointSize*2 && dist > 0) {
                        point1.color = "red"
                        let dx = point1.pos.x - point2.pos.x
                        let dy = point1.pos.y - point2.pos.y
                        let overlap = pointSize*2-dist
                        point1.pos = Vector2.add(point1.pos, new Vector2(overlap*dx/dist, overlap*dy/dist))
                        let J = point1.mass*point1.vel.getMagnitude()*2
                        let normalForce = new Vector2(J*dx/dist, J*dy/dist)
                        point1.addForce(normalForce) //normal vector comes from impulse: J = deltaP = -P0 - P0 = -2P0 = -2mv
                        //point1.vel.x = -point1.vel.x; point1.vel.y = -point1.vel.y
                    }
                }
            }
        }
        //this might be broken, make sure to fix ^^^^^^^
    }

    this.updatePosition = function() {
        for(let point of this.points.values()) {
            point.updatePosition()
        }
    }

    this.outerPoints = function() {
        let outline = []
        for(let i = 0; i < w*h; i++) {
            if(i < w) {
                outline.push(this.points.get(i))
            }
        }
        for(let i = 0; i < w*h; i++) {
            if(i%w == w-1) {
                outline.push(this.points.get(i))
            }
        }
        let bottom = []
        for(let i = 0; i < w*h; i++) {
            if(i > (w*h)-w) {
                bottom.push(this.points.get(i))
            }
        }
        outline = outline.concat(bottom.reverse())
        let left = []
        for(let i = 0; i < w*h; i++) {
            if(i%w == 0) {
                left.push(this.points.get(i))
            }
        }
        outline = outline.concat(left.reverse())
        return outline
    }

    this.render = function() {
        if(!this.mesh) {
            for(let i = 0; i < w*h; i++) {
                let point1 = this.points.get(i)
                ctx.lineWidth = 1
                ctx.strokeStyle = "white"
                ctx.beginPath(); ctx.moveTo(point1.pos.x, point1.pos.y)
                if(i%w != 0) {
                    let point2 = this.points.get(i-1)
                    ctx.lineTo(point2.pos.x, point2.pos.y); ctx.moveTo(point1.pos.x, point1.pos.y)
                }
                if(i > w-1) {
                    let point2 = this.points.get(i-w)
                    ctx.lineTo(point2.pos.x, point2.pos.y); ctx.moveTo(point1.pos.x, point1.pos.y)
                }
                if(i%w != 0 && i > w-1) {
                    let point2 = this.points.get(i-w-1)
                    ctx.lineTo(point2.pos.x, point2.pos.y); ctx.moveTo(point1.pos.x, point1.pos.y)
                }
                if(i%w != w-1 && i > w-1) {
                    let point2 = this.points.get(i-w+1)
                    ctx.lineTo(point2.pos.x, point2.pos.y); ctx.moveTo(point1.pos.x, point1.pos.y)
                }
                ctx.closePath(); ctx.stroke()
            }
            for(let point of this.points.values()) {
                point.render()
            }
        } else {
            let outline = this.outerPoints()
            ctx.beginPath()
            ctx.moveTo(outline[0].pos.x, outline[0].pos.y)
            for(let i = 0; i < outline.length-1; i++) {
                ctx.lineTo(outline[i+1].pos.x, outline[i+1].pos.y)
            }
            ctx.fillStyle = this.color
            ctx.closePath()
            ctx.fill()
        }
    }
    
}