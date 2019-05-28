const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users"

const grab = (selectorStr, parent = document) => parent.querySelector(selectorStr)

document.addEventListener('DOMContentLoaded', event => {
  const img = document.createElement("img")
  img.src = "./otter-sprite.png"

  const stage = new createjs.Stage("canvas")

  const circle = new createjs.Shape()
  circle.graphics.beginFill("red").drawCircle(0, 0, 25)
  circle.radius = 25
  circle.diameter = 2 * circle.radius

  circle.x = canvas.width/2
  circle.y = canvas.height - circle.radius

  const leftBound = circle.radius
  const rightBound = canvas.width - circle.radius

  stage.addChild(circle)
  stage.update()

  let moveX = ""
  let canMove = true

  document.addEventListener('keydown', e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      moveX = e.key
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      moveX = ""
    }
  })

  createjs.Ticker.framerate = 60
  createjs.Ticker.addEventListener("tick", gameMovement)

  let t = 0

  function gameMovement() {
    t += 1
    if (t % 30 === 0) {
      addPlat()
    }

    if (hasCollided()) {
      stage.removeChild(...platArr)
      stage.update()
      platArr = []
      alert(`You lose. Final time: ${Math.floor(t/60)} seconds`)
      t = 0
    }

    if (moveX === "ArrowLeft" && circle.x > leftBound) {
      circle.x -= 4
      stage.update()
    } else if (moveX === "ArrowRight" && circle.x < rightBound) {
      circle.x += 4
      stage.update()
    }

    for (const plat of platArr) {
      plat.y += plat.speed
      stage.update()
    }
  }

  let platArr = []

  function addPlat() {
    const plat = new createjs.Shape()
    plat.graphics.beginFill("blue").drawRect(0, 0, 10, 50)
    plat.w = 10
    plat.h = 50
    plat.x = Math.floor(Math.random() * 450)
    plat.y = 0
    plat.speed = Math.ceil(Math.random() * 10) + Math.floor(t/120) //random num 1~10, base +1 every 2s
    stage.addChild(plat)
    stage.update()
    platArr.push(plat)
  }

  function hasCollided() {
    let collided
    for (const plat of platArr) {
      if (plat.x < circle.x + circle.radius &&
        plat.x + plat.w > circle.x - circle.radius &&
        plat.y < circle.y + circle.radius &&
        plat.h + plat.y > circle.y - circle.radius
      ) {
        collided = true
        break
      } else {
        collided = false
      }
    }
    return collided
  }

  const pauseBtn = grab("#pause")
  pauseBtn.addEventListener("click", () => {
    console.log(circle)
    console.log(platArr)
    debugger
  })

})
