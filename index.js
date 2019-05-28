const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users"

const grab = (selectorStr, parent = document) => parent.querySelector(selectorStr)

document.addEventListener('DOMContentLoaded', event => {
  const stage = new createjs.Stage("canvas")

  const circle = new createjs.Shape()
  circle.graphics.beginFill("red").drawCircle(0, 0, 10)
  circle.radius = 5
  circle.diameter = 2 * circle.radius

  circle.x = canvas.width/2
  circle.y = canvas.height - 10

  const leftBound = circle.diameter
  const rightBound = canvas.width - circle.diameter
  const topBound = circle.diameter
  const bottBound = canvas.height - circle.diameter

  stage.addChild(circle)
  stage.update()

  let moveY = ""
  let moveX = ""
  let gravitySpeed = 0
  let gravity = 0.02
  let canMove = true

  document.addEventListener('keydown', e => {
    if (canMove) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        moveY = e.key
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        moveX = e.key
      }
    }

    if (e.key === "Enter") {
      canMove = !canMove
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      moveY = ""
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      moveX = ""
    }
  })

  createjs.Ticker.framerate = 80
  createjs.Ticker.addEventListener("tick", moveCirc)

  function moveCirc() {
    if (circle.y < bottBound) {
      gravitySpeed += gravity
      circle.y += gravitySpeed
      stage.update()
    } else {
      gravitySpeed = 0
      canMove = true
    }

    if (gravitySpeed >= 3) {
      canMove = false
      moveX = ""
      moveY = ""
    }

    if (moveY === "ArrowUp" && circle.y > topBound) {
      circle.y -= 3
      stage.update()
    } else if (moveY === "ArrowDown" && circle.y < bottBound) {
      circle.y += 3
      stage.update()
    }

    if (moveX === "ArrowLeft" && circle.x > leftBound) {
      circle.x -= 2
      stage.update()
    } else if (moveX === "ArrowRight" && circle.x < rightBound) {
      circle.x += 2
      stage.update()
    }
  }

  const platArr = []

  for (let i=1; i<=7; i++) {
    const plat = new createjs.Shape()
    plat.graphics.beginFill("blue").drawRect(0, 0, 50, 10)
    plat.x = Math.floor(Math.random() * 450)
    plat.y = i*100
    stage.addChild(plat)
    stage.update()
    platArr.push(plat)
  }

  function collisionY() {
    // for (const plat of platArr) {
    //
    // }
  }

  function collisionX() {}

  // let moveAmt = 10
  //
  // function handleTick() {
  //   circle.x += moveAmt
  //   if (circle.x > stage.canvas.width || circle.x < 0) { moveAmt *= -1}
  //   stage.update()
  // }

  // fetch(USERS_URL, {method: 'GET'}).then(r => r.json()).then(json => {
  //   console.log(json)
  //   console.log(canvas)
  // })

})


// function startGame() {
//     myGameArea.start();
// }
//
// var myGameArea = {
//   this.interval = setInterval(updateGameArea, 20);
// }
//
// function component(width, height, color, x, y, type) {
//     this.gravity = 0.05;
//     this.gravitySpeed = 0;
//     this.update = function() {
//         ctx = myGameArea.context;
//         ctx.fillStyle = color;
//         ctx.fillRect(this.x, this.y, this.width, this.height);
//     }
//     this.newPos = function() {
//         this.gravitySpeed += this.gravity;
//         this.x += this.speedX;
//         this.y += this.speedY + this.gravitySpeed;
//         this.hitBottom();
//     }
//     this.hitBottom = function() {
//         var rockbottom = myGameArea.canvas.height - this.height;
//         if (this.y > rockbottom) {
//             this.y = rockbottom;
//             this.gravitySpeed = 0;
//         }
//     }
// }
//
// function updateGameArea() {
//     myGameArea.clear();
//     myGamePiece.newPos();
//     myGamePiece.update();
// }
//
// function accelerate(n) {
//     myGamePiece.gravity = n;
// }
