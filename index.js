const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users"
const SCORES_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/scores"
const registeredUsers = [];
const grab = (selectorStr, parent = document) => parent.querySelector(selectorStr)
let currentUser;

document.addEventListener('DOMContentLoaded', event => {
  const gameContainer = grab("#game-container")
  //get all users
  fetch(USERS_URL)
    .then(r => r.json())
    .then(users => registeredUsers.push(...users))

  fetch(SCORES_URL)
    .then(r => r.json())
    .then(scores => {
      const scoresUl = grab("#scores-ul")
      scores.sort((scoreA, scoreB) => scoreB.value - scoreA.value)
      for (let i=0; i<10; i++) {
        if (scores[i]) {
          const newLi = document.createElement("li")
          newLi.innerHTML = `<b>${i+1}.</b> ${scores[i].user.name} ― ${scores[i].value}s`
          scoresUl.appendChild(newLi)
          scoresUl.appendChild(document.createElement("br"))
        }
      }
    })

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
          body: JSON.stringify({
            user: {name: playInputName.value}
          })
        })
          .then(r => r.json())
          .then(json => currentUser = json)
      }

      const form = grab("#username-form")
      form.reset()
      form.remove()
      const canvas = grab("#canvas")
      canvas.style.display = ""

      // Run video game
      const stage = new createjs.Stage("canvas")

      var riverImg = new Image()
      riverImg.src = "./images/river.jpg";

      riverImg.onload = () => {
        var shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(riverImg);
        shape.graphics.drawRect(0,0,750,750);
        shape.x = shape.y = 0
        shape.alpha = 0.5
        stage.addChild(shape)
        stage.setChildIndex(otter, stage.getNumChildren() - 1);
      }

      stage.update()

      const otterImg = new Image();
      otterImg.src = "./images/otter-sprite.png";
      otterImg.onload = handleOtterImageLoad;
      let otter
      let leftBound = 0
      let rightBound //dependant on otter width


      function handleOtterImageLoad(event) {
        const image = event.target;
        otter = new createjs.Bitmap(image);
        stage.addChild(otter);
        otter.w = 50
        otter.h = 64
        otter.x = canvas.width/2 - otter.w/2
        otter.y = canvas.height - otter.h
        otter.speed = 3

        rightBound = canvas.width - otter.w
      }

      let moveX = ""

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
      let timeScore = 0

      function gameMovement() {
        t += 1

        if (t % 60 === 0) timeScore += 1

        // debugger
        if (t % Math.floor(1.5 * dropFreq) === 0) {
          addLog()
          if (dropFreq > 10) {
            dropFreq -= 1
          }
        }

        if (t % 600 === 0) {
          otter.speed += 1
          console.log(otter.speed)
        }

        if (hasCollided()) {
          stage.removeChild(...logArr)
          stage.update()
          logArr = []
          alert(`You lose. Final time: ${timeScore} seconds`)
          fetch("https://swimmy-otter-backend.herokuapp.com/api/v1/scores", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              score: {
                user_id: currentUser.id,
                value: timeScore
              }
            })
          })
          dropFreq = 60
          t = 0
          timeScore = 0
          otter.speed = 3
        }

        if (moveX === "ArrowLeft" && otter.x > leftBound) {
          otter.x -= otter.speed
          stage.update()
        } else if (moveX === "ArrowRight" && otter.x < rightBound) {
          otter.x += otter.speed
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
        logArr.push(log)

        stage.addChild(log)
        stage.update()
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
            // BREAK NECESSARY SO collided ISN'T ALWAYS BASED ON LAST log IN logArr
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
