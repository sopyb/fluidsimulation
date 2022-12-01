// global constants
const canvas = document.getElementById('render'),
  ctx = canvas.getContext('2d'),
  damping = 0.8;

// global settings
let scale = 0.2,
  paused = false,
  gravity = 1,
  starty = 100,
  particlesCount = 1000,
  particleWeight = 0.2,
  particleSpawnVelocity = 10,
  maxVelocity = 5;

// TODO: add a way to change these settings

let Mouse = {
  x: 0,
  y: 0
}

// time for consistency
let time = Date.now(),
  deltaTime = 1000 / 60;

class Particle {
  constructor (x, y, vx, vy, weight) {
    this.x = x + Math.floor(Math.random() * 20)
    this.y = starty
    this.vx = vx
    this.vy = vy + (Math.floor(Math.random()*20)-10)
    this.weight = weight
  }

  _checkKeep () {
    // check if particle is still on screen
    if (this.x < 0 || this.x > canvas.width) {
      return false
    }

    // check collision with floor
    if (this.y >= canvas.height) {
      // bounce off floor
      this.vy = -this.vy * damping * (Math.random() * 0.1 + 0.9)
      this.y = canvas.height - 2

      // drag on floor
      this.vx *= damping * (Math.random() * 0.2 + 0.8)

      // check if particle is still moving
      if (Math.abs(this.vx) < 0.01) {
        return false
      }

      return true
    }

    // if particle is over 100 the top of the screen, kill it no way that's going to be seen
    if (this.y < -100) {
      return false
    }

    // if particle has little or  no velocity, kill it
    return !(this.vx < -1 && Math.abs(this.vy) <= 1);
  }

  _respawn () {
    this.x = Math.floor(Math.random() * 2)
    this.y = starty + Math.floor(Math.random() * 20)

    this.vx = particleSpawnVelocity - Math.random() * particleSpawnVelocity / 2
    this.vy = (Math.floor(Math.random()*1)+3)
  }

  update (step) {
    // gravity applied based on time passed since last frame
    this.vy += gravity * this.weight * step

    // clamp velocity
    if (this.vx > maxVelocity) {
      this.vx = maxVelocity
    } else if (this.vx < -maxVelocity) {
      this.vx = -maxVelocity
    }

    if (this.vy > maxVelocity) {
      this.vy = maxVelocity
    } else if (this.vy < -maxVelocity) {
      this.vy = -maxVelocity
    }

    // update position
    this.x += this.vx * step
    this.y += this.vy * step

    // check if particle should be kept
    if (!this._checkKeep()) {
      this._respawn()
    }
  }
}

// create particles
let particles = [],
  updateParticleCount = () => {
    for (let i = 0; i < particlesCount; i++) {
      particles.push(new Particle(0, starty + Math.floor(Math.random()*20), particleSpawnVelocity, 0, particleWeight))
    }
  }

updateParticleCount()

// set canvas size
canvas.width = window.innerWidth * scale
canvas.height = window.innerHeight * scale

// on resize
window.onresize = () => {
  canvas.width = window.innerWidth * scale
  canvas.height = window.innerHeight * scale
}

// render stuff
let render = () => {
  deltaTime = Date.now() - time
  time = Date.now()

  // draw background
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // draw particles
  ctx.fillStyle = 'blue'
  for (let i = 0; i < particles.length; i++) {
    ctx.fillRect(Math.floor(particles[i].x), Math.floor(particles[i].y), 1, 1)
  }

  // update particles
  if (!paused) {
    let step = 1000 / deltaTime * 0.01
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(step)
    }
  }
}


setInterval(render, 1000 / 60)







