const log1Img = new Image();
log1Img.src = "./images/log-1.png";
log1Img.dataset.w = 30
log1Img.dataset.h = 65

const log2Img = new Image();
log2Img.src = "./images/log-2.png";
log2Img.dataset.w = 25
log2Img.dataset.h = 65

const log3Img = new Image();
log3Img.src = "./images/log-3.png";
log3Img.dataset.w = 15
log3Img.dataset.h = 46

const log4Img = new Image();
log4Img.src = "./images/log-4.png";
log4Img.dataset.w = 10
log4Img.dataset.h = 50

const log5Img = new Image();
log5Img.src = "./images/log-5.png";
log5Img.dataset.w = 20
log5Img.dataset.h = 81


const logImgsArr = [log1Img, log2Img, log3Img, log4Img, log5Img]

class Log {
  constructor(img) {
    const log = new createjs.Bitmap(img)
    this.log = log
    this.log.w = parseInt(img.dataset.w)
    this.log.h = parseInt(img.dataset.h)
    this.log.x = Math.floor(Math.random() * (canvas.width - this.log.w))
    this.log.y = -100
  }
}
