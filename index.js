const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users";
const SCORES_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/scores";
const registeredUsers = [];
const grab = (selectorStr, parent = document) =>
  parent.querySelector(selectorStr);
let currentUser;

document.addEventListener("DOMContentLoaded", (event) => {
  const gameContainer = grab("#game-container");
  //get all users
  fetch(USERS_URL)
    .then((r) => r.json())
    .then((users) => registeredUsers.push(...users));

  fetch(SCORES_URL)
    .then((r) => r.json())
    .then((scores) => {
      const scoresUl = grab("#scores-ul");
      scores.sort((scoreA, scoreB) => scoreB.value - scoreA.value);
      for (let i = 0; i < 10; i++) {
        if (scores[i]) {
          const newLi = document.createElement("li");
          newLi.innerHTML = `<b>${i + 1}.</b> ${scores[i].user.name} ― ${
            scores[i].value
          }s`;
          scoresUl.appendChild(newLi);
          scoresUl.appendChild(document.createElement("br"));
        }
      }
    });

  document.addEventListener("click", (event) => {
    event.preventDefault();

    if (event.target.value === "PLAY") {
      let playInputName = event.target.previousElementSibling;

      currentUser = registeredUsers.find((user) => {
        return user.name === playInputName.value;
      }); //registeredUsers forEach

      if (!currentUser) {
        fetch("https://swimmy-otter-backend.herokuapp.com/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user: { name: playInputName.value },
          }),
        })
          .then((r) => r.json())
          .then((json) => (currentUser = json));
      }

      const form = grab("#username-form");
      form.reset();
      form.remove();
      const title = grab("#title");
      title.reset();
      title.remove();

      const canvas = grab("#canvas");
      canvas.style.display = "";

      // GAME STARTS HERE /////////////////////////////////////////////
      const stage = new createjs.Stage("canvas");

      const riverImg = new Image();
      riverImg.src = "./images/river.jpg";

      riverImg.onload = () => {
        const whiteBkgr = new createjs.Shape();
        whiteBkgr.graphics.beginFill("white").drawRect(0, 0, 750, 750);
        whiteBkgr.x = whiteBkgr.y = 0;
        stage.addChild(whiteBkgr);

        const riverBkgr = new createjs.Shape();
        riverBkgr.graphics.beginBitmapFill(riverImg).drawRect(0, 0, 750, 750);
        riverBkgr.x = riverBkgr.y = 0;
        riverBkgr.alpha = 0.5;
        stage.addChild(riverBkgr);

        stage.setChildIndex(riverBkgr, stage.getNumChildren() - 1);
        stage.setChildIndex(otter, stage.getNumChildren() - 1);
      };

      stage.update();

      const otterImg = new Image();
      otterImg.src = "./images/otter-sprite.png";
      otterImg.onload = handleOtterImageLoad;
      let otter;
      let leftBound = 0;
      let rightBound; //dependant on otter width

      function handleOtterImageLoad(event) {
        const image = event.target;
        otter = new createjs.Bitmap(image);
        stage.addChild(otter);
        otter.w = 50;
        otter.h = 64;
        otter.x = canvas.width / 2 - otter.w / 2;
        otter.y = canvas.height - otter.h;
        otter.speed = 3;

        rightBound = canvas.width - otter.w;
      }

      let moveX = "";

      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          moveX = e.key;
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          moveX = "";
        }
      });

      // timeScore INCREASES EVERY 60 TICKS OF T. THIS IS THE SCORE THAT GETS POSTED AT THE END
      // USE t FOR GAME FUNCTIONALITY AND timeScore FOR FINAL SCORE
      let t = 1;
      let dropFreq = 60;
      let timeScore = 0;
      let gameOn = true;

      const scoreDiv = grab("#score-div");
      scoreDiv.style.display = "flex";
      scoreDiv.style.flexDirection = "column";

      const playAgainBtn = grab("#play-again-btn");
      playAgainBtn.style.display = "none";

      const scoreH2 = grab("#score-div-h2");
      scoreH2.style.border = "2px solid #33CC00";
      scoreH2.style.color = "#33CC00";

      const scoreNum = grab("#score-num");
      scoreNum.innerText = "0";

      createjs.Ticker.framerate = 60;
      createjs.Ticker.addEventListener("tick", callGameIfGameOn);

      function callGameIfGameOn() {
        if (gameOn) gameMovement();
      }

      function gameMovement() {
        // t IS TIME IN FRAMES (60FPS), gameScore IS "SECONDS" (FRAMES/60) ///////////////
        t += 1;

        if (t % 60 === 0) {
          timeScore += 1;
          scoreNum.innerText = timeScore;
        }

        ////// BEGIN OTTER MOVEMENT //////////////////////////////
        // INCREASE OTTER SPEED EVERY 10s ///////////////
        if (t % 600 === 0) {
          otter.speed += 1;
        }

        // MOVE L & R WHILE HOLDING ⬅️ OR ➡️ ///////////////
        if (moveX === "ArrowLeft" && otter.x > leftBound) {
          otter.x -= otter.speed;
          stage.update();
        } else if (moveX === "ArrowRight" && otter.x < rightBound) {
          otter.x += otter.speed;
          stage.update();
        }
        ////// END OTTER MOVEMENT //////////////////////////////

        ////// BEGIN LOG MOVEMENT //////////////////////////////
        // ADD LOGS WITH INCR. FREQ. ///////////////
        if (t % Math.floor(1.5 * dropFreq) === 0) {
          addLog();
          if (dropFreq > 5) {
            dropFreq -= Math.floor(2 * Math.random());
          }
        }

        // LOG COLLISION, i.e. LOSE CONDITION ///////////////
        if (hasLogCollided()) {
          stage.removeChild(...logArr);
          stage.update();
          logArr = [];
          stage.removeChild(currPowerUp);
          currPowerUp = false;
          gameOn = false;

          scoreH2.style.borderColor = "red";
          scoreH2.style.color = "red";

          playAgainBtn.style.display = "";

          playAgainBtn.addEventListener("click", (event) => {
            gameOn = true;
            playAgainBtn.style.display = "none";
            scoreH2.style.border = "2px solid #33CC00";
            scoreH2.style.color = "#33CC00";
            scoreNum.innerText = "0";
          });

          fetch("https://swimmy-otter-backend.herokuapp.com/api/v1/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              score: {
                user_id: currentUser.id,
                value: timeScore,
              },
            }),
          });

          dropFreq = 60;
          t = 1;
          timeScore = 0;
          otter.speed = 3;
        }

        // MOVE EACH LOG DOWN A NUMBER OF PIXELS ACCORDING TO ITS "SPEED" ///////////////
        // REMOVE ALL LOGS THAT ARE NO LONGER ON SCREEN ///////////////
        for (let i = 0; i < logArr.length; i++) {
          logArr[i].y += logArr[i].speed;
          stage.update();
          if (logArr[i].y > canvas.height) {
            stage.removeChild(logArr[i]);
            logArr.splice(i, 1);
            i--;
          }
        }
        ////// END LOG MOVEMENT //////////////////////////////

        ////// BEGIN POWERUP MOVEMENT //////////////////////////////
        if (t % dropPowerUpAfter === 0) {
          currPowerUp = dropPowerUp();
        }

        if (hasPUCollided()) {
          stage.removeChild(currPowerUp);
          currPowerUp = false;
          t -= 900;
          dropFreq += 5;
          powerUpSpeed += 2;
          dropPowerUpAfter = addTimeToPowerUp(t);
        }

        if (currPowerUp) {
          currPowerUp.y += powerUpSpeed;
          stage.update();
          if (currPowerUp.y > canvas.height) {
            stage.removeChild(currPowerUp);
            currPowerUp = false;
            // dropPowerUpAfter = addTimeToPowerUp(t)
          }
        }
        ////// END POWERUP MOVEMENT //////////////////////////////
      }
      ////////// END gameMovement() ///////////////

      ////// BEGIN LOG FUNCTIONALITY ////////////////////
      let logArr = [];

      function addLog() {
        const randomLogImg =
          logImgsArr[Math.floor(logImgsArr.length * Math.random())];
        const log = new Log(randomLogImg).log;
        log.speed = Math.floor(Math.random() * 7) + Math.floor(t / 120); //random num 1~10, base +1 every 2s
        logArr.push(log);

        stage.addChild(log);
        stage.update();
      }

      function hasLogCollided() {
        let collided;
        for (const log of logArr) {
          if (
            log.x < otter.x + otter.w &&
            log.x + log.w > otter.x &&
            log.y < otter.y + otter.h &&
            log.h + log.y > otter.y
          ) {
            collided = true;
            break;
            // BREAK NECESSARY SO collided ISN'T ALWAYS BASED ON LAST log IN logArr
          } else {
            collided = false;
          }
        }
        return collided;
      }
      ////// END LOG FUNCTIONALITY ////////////////////

      ////// BEGIN POWERUP FUNCTIONALITY ////////////////////
      const watchImg = new Image();
      watchImg.src = "./images/stopwatch-emoji.png";
      const addTimeToPowerUp = (currT) =>
        currT + 1200 + Math.floor(450 * Math.random());

      let currPowerUp = false;
      let dropPowerUpAfter = addTimeToPowerUp(0);
      let powerUpSpeed = 3;

      function dropPowerUp() {
        const powerUp = new createjs.Bitmap(watchImg);
        powerUp.w = powerUp.h = 60;
        powerUp.x = Math.floor(Math.random() * (canvas.width - powerUp.w));
        powerUp.y = -100;
        stage.addChild(powerUp);
        return powerUp;
      }

      function hasPUCollided() {
        if (
          currPowerUp.x < otter.x + otter.w &&
          currPowerUp.x + currPowerUp.w > otter.x &&
          currPowerUp.y < otter.y + otter.h &&
          currPowerUp.h + currPowerUp.y > otter.y
        ) {
          return true;
          // BREAK NECESSARY SO collided ISN'T ALWAYS BASED ON LAST log IN logArr
        } else {
          return false;
        }
      }
      ////// END POWERUP FUNCTIONALITY ////////////////////
    }
  });
});
