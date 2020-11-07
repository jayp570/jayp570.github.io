window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('wheel', scrollHandler, false);

function keyDownHandler(e) {

    let player = players[0]

    let code = e.keyCode;
    player.setDirection(code,true);

    //dash
    if(code == 32) {
        players[0].dash()
    }

    //pick up weapon
    if(code == 69 && player.heldGun.name == "pistol") {
        for(let i = 0; i < items.length; i++) {
            let item = items[i]
            if(item.carrier == null) {
                if(getDist(player, item) < 110) {
                    player.heldGun.carrier = null
                    item.carrier = player
                    player.heldGun = item
                    break;
                }
            }
        }
    }

    //reload weopon
    if(code == 82 && player.heldGun.reloading == false && player.heldGun.clip < player.heldGun.maxClip) {
        player.heldGun.reloadStartFrame = player.heldGun.frame
    }

    //throw grenade
    if(code == 71) {
        player.throwGrenade()
    }

    //throw weapon
    if(code == 81) {
        players[0].throwWeapon()
    }

    //show leaderboard
    if(code == 70) {
        showingLeaderboard = true;
    }





    //testing
    if(code == 57) {
        crates.push(new Crate(cursorPos.x, cursorPos.y))
    }
    if(code == 48) {
        explosiveBarrels.push(new ExplosiveBarrel(cursorPos.x, cursorPos.y))
    }
}

function keyUpHandler(e) {
    let code = e.keyCode;
    players[0].setDirection(code,false);

    //hide leaderboard
    if(code == 70) {
        showingLeaderboard = false;
    }
}

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    cursorPos = {x: mouseX, y: mouseY}
    let playerX = players[0].pos.x; let playerY = players[0].pos.y;
    let x = playerX-mouseX; let y = playerY-mouseY;
    players[0].aimAngle = Math.atan2(-y, -x)*(180/Math.PI)
}

function mouseDownHandler(e) {
    players[0].shoot()
}

function scrollHandler(e) {
    // if(players[0].gunInventory.length > 1) {
    //     let playerLookAngle = players[0].gunInventory[players[0].heldSlot].angle
    //     if(players[0].heldSlot == 0) {
    //         players[0].heldSlot = 1
    //         players[0].gunInventory[players[0].heldSlot].angle = playerLookAngle
    //     } else if(players[0].heldSlot == 1) {
    //         players[0].heldSlot = 0
    //         players[0].gunInventory[players[0].heldSlot].angle = playerLookAngle
    //     }
    // }
}