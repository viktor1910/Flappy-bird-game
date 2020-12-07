const cvs = document.getElementById("myCanvas");
const ctx = cvs.getContext("2d");

let frames = 0;
const DEGREE = Math.PI / 180;

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};

const SCORE_S = new Audio();
SCORE_S.src = "./assets/audio/point.wav";
const HIT_S = new Audio();
HIT_S.src = "./assets/audio/hit.wav";
const FLAP_S = new Audio();
FLAP_S.src = "./assets/audio/wing.wav";
const SWOOSHING_S = new Audio();
SWOOSHING_S.src = "./assets/audio/swoosh.wav";
const DIE_S = new Audio();
DIE_S.src = "./assets/audio/die.wav";

document.addEventListener("click", function (e) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      SWOOSHING_S.play();
      break;
    case state.game:
      bird.flap();
      FLAP_S.play();
      break;
    case state.over:
      state.current = state.getReady;
      bird.reset();
      pipes.reset();
      score.reset();
      break;
  }
});

const bg = {
  w: 288,
  h: 512,
  x: 0,
  y: 0,

  draw: function () {
    const image = new Image();
    image.src = "./assets/sprites/background-day.png";
    ctx.drawImage(image, this.x, this.y, this.w, this.h);
    ctx.drawImage(image, this.x + this.w, this.y, this.w, this.h);
  },
};

const fg = {
  w: 366,
  h: 112,
  x: 0,
  y: cvs.height - 112,
  dx: 2,
  draw: function () {
    const image = new Image();
    image.src = "./assets/sprites/base.png";
    ctx.drawImage(image, this.x, this.y, this.w, this.h);
    ctx.drawImage(image, this.x + this.w, this.y, this.w, this.h);
  },

  update: function () {
    if (state.current === state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },
};

const bird = {
  animation: [
    "./assets/sprites/yellowbird-midflap.png",
    "./assets/sprites/yellowbird-downflap.png",
    "./assets/sprites/yellowbird-midflap.png",
    "./assets/sprites/yellowbird-upflap.png",
  ],
  w: 34,
  h: 24,
  x: 50,
  y: 150,
  frame: 0,

  radius: 12,

  gravity: 0.25,
  jump: 4.6,
  speed: 0,
  rotation: 0,

  draw: function () {
    const image = new Image();
    image.src = this.animation[this.frame];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(image, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  },

  flap: function () {
    this.speed = -this.jump;
  },

  update: function () {
    this.period = state.current === state.getReady ? 10 : 5;
    this.frame += frames % this.period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (state.current === state.getReady) {
      this.y = 150;
      this.rotation = 0 * DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (state.current === state.game) {
          state.current = state.over;
          DIE_S.play();
        }
      }

      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  },
  reset: function () {
    this.speed = 0;
  },
};

const getReady = {
  w: 184,
  h: 267,
  x: cvs.width / 2 - 184 / 2,
  y: 80,
  draw: function () {
    const image = new Image();
    image.src = "./assets/sprites/message.png";
    if (state.current === state.getReady)
      ctx.drawImage(image, this.x, this.y, this.w, this.h);
  },
};

const gameOver = {
  w: 192,
  h: 42,
  x: cvs.width / 2 - 192 / 2,
  y: 150,
  draw: function () {
    const image = new Image();
    image.src = "./assets/sprites/gameover.png";
    if (state.current === state.over)
      ctx.drawImage(image, this.x, this.y, this.w, this.h);
  },
};

const pipes = {
  position: [],
  bottom: "./assets/sprites/pipe-up.png",
  top: "./assets/sprites/pipe-down.png",
  h: 320,
  w: 52,
  gap: 85,
  maxYPos: -150,

  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      const topPipe = new Image();
      const bottomPipe = new Image();
      topPipe.src = this.top;
      bottomPipe.src = this.bottom;

      ctx.drawImage(bottomPipe, p.x, bottomYPos, this.w, this.h);
      ctx.drawImage(topPipe, p.x, topYPos, this.w, this.h);
    }
  },
  update: function () {
    if (state.current !== state.game) return;
    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx;

      let bottomPipeYPos = p.y + this.h + this.gap;
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over;
        HIT_S.play();
      }

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.over;
        HIT_S.play();
      }

      if (p.x + this.w <= 0) {
        this.position.shift();
        SCORE_S.play();
        score.value += 1;
      }
    }
  },
  reset: function () {
    this.position = [];
  },
};

const score = {
  value: 0,
  draw: function () {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";

    if (state.current !== state.getReady) {
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    }
  },
  reset: function () {
    this.value = 0;
  },
};

function draw() {
  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}

function update() {
  bird.update();
  fg.update();
  pipes.update();
}

function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}
loop();
