const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users"
const registeredUsers = [];
const grab = (selectorStr, parent = document) => parent.querySelector(selectorStr)
let currentUser;

document.addEventListener('DOMContentLoaded', event => {
  const gameContainer = grab("#game-container")
  //get all users
  fetch(USERS_URL)
    .then(r => r.json()).then(users => registeredUsers.push(...users))

  //login form
  gameContainer.innerHTML += `
    <div id="form-container">
      <form id="username-form">
        <label for="name">Name</label>
        <input type="text" name="name" value="">
        <input type="submit" value="PLAY">
      </form>
    </div>
  `

  document.addEventListener("click", event => {
    event.preventDefault();

    if (event.target.value === "PLAY") {
      let playInputName = event.target.previousElementSibling

      currentUser = registeredUsers.find(user => {
        return user.name === playInputName.value
      }) //registeredUsers forEach

      if (!currentUser) {
        fetch("https://swimmy-otter-backend.herokuapp.com/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({name: playInputName.value})
        })
          .then(r => r.json()).then(json => currentUser = json)
      }

      const form = grab("#username-form")
      form.reset()
      form.remove()
      const canvas = grab("#canvas")
      canvas.style.display = ""

      // Run video game
      const stage = new createjs.Stage("canvas")

      const otterImg = new Image();
      otterImg.src = "./images/otter-sprite.png";
      otterImg.onload = handleOtterImageLoad;
      let otter
      let leftBound
      let rightBound

      function handleOtterImageLoad(event) {
        const image = event.target;
        otter = new createjs.Bitmap(image);
        stage.addChild(otter);
        otter.w = 50
        otter.h = 64
        otter.x = canvas.width/2 - otter.w/2
        otter.y = canvas.height - otter.h

        leftBound = 0
        rightBound = canvas.width - otter.w
      }

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
      let dropFreq = 60

      function gameMovement() {
        t += 1

        if (t % dropFreq === 0) {
          addLog()
          if (dropFreq > 10) dropFreq -= 1
        }

        if (hasCollided()) {
          stage.removeChild(...logArr)
          stage.update()
          logArr = []
          alert(`You lose. Final time: ${Math.floor(t/60)} seconds`)
          dropFreq = 60
          t = 0
        }

        if (moveX === "ArrowLeft" && otter.x > leftBound) {
          otter.x -= 4
          stage.update()
        } else if (moveX === "ArrowRight" && otter.x < rightBound) {
          otter.x += 4
          stage.update()
        }

        for (let i=0; i < logArr.length; i++) {
          logArr[i].y += logArr[i].speed
          stage.update()
          if (logArr[i].y > canvas.height) {
            stage.removeChild(logArr[i])
            logArr.splice(i, 1)
            i--
          }
        }
      }

      let logArr = []

      function addLog() {

        const randomLogImg = logImgsArr[Math.floor(logImgsArr.length * Math.random())]
        const log = new Log(randomLogImg).log

        log.speed = Math.ceil(Math.random() * 10) + Math.floor(t/120) //random num 1~10, base +1 every 2s

        console.log(log.speed, Math.floor(t/120), dropFreq)

        stage.addChild(log)
        stage.update()
        logArr.push(log)
      }

      function hasCollided() {
        let collided
        for (const log of logArr) {
          if (
            log.x < otter.x + otter.w &&
            log.x + log.w > otter.x &&
            log.y < otter.y + otter.h &&
            log.h + log.y > otter.y
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
        console.log(logArr)
        console.log(otter)
        debugger
      })
    }
  })
})
