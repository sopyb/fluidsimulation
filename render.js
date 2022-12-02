let fluid = new FluidBox(settings.resolution),
  canvas = document.querySelector('#render'),
  ctx = canvas.getContext('2d'),
  mouse = {
    x: -1,
    y: -1,
    py: -1,
    px: -1,
    down: false
  }

// set canvas width and height
canvas.width = settings.resolution
canvas.height = settings.resolution

// overwrite the updateCallback function
updateCallback = () => {
  // replace simulation with new settings
  fluid = new FluidBox(settings.resolution, fluid)

  // set canvas width and height
  canvas.width = settings.resolution
  canvas.height = settings.resolution
}

/**************************************************************************\
 *                                 Events                                 *
\**************************************************************************/

// on mousedown
canvas.addEventListener('mousedown', e => {
  mouse.down = true

  // set mouse position
  mouse.x = e.offsetX
  mouse.y = e.offsetY

  // set previous mouse position
  mouse.px = e.offsetX
  mouse.py = e.offsetY
})

// on mousemove
canvas.addEventListener('mousemove', e => {
  // if mouse is down
  if (mouse.down) {
    // update px and py
    mouse.px = mouse.x
    mouse.py = mouse.y

    // set mouse position
    mouse.x = e.offsetX
    mouse.y = e.offsetY
  }
})

// on mouseup
canvas.addEventListener('mouseup', () => {
  mouse.down = false

  // clear mouse position
  mouse.x = -1
  mouse.y = -1
  mouse.px = -1
  mouse.py = -1
})

/**************************************************************************\
 *               Rendering the fluid simulation on the canvas             *
\**************************************************************************/

function render () {

  for (let i = 0; i < settings.resolution * settings.resolution; i++) {
    let x = i % settings.resolution,
      y = Math.floor(i / settings.resolution),
      d = fluid.density[i]

    ctx.fillStyle = `rgb(${d}, ${d}, ${d})`
    ctx.fillRect(x, y, 1, 1)
  }

  if (mouse.down) {
    // calculate position in canvas
        let x = Math.floor(mouse.x / (window.innerHeight / settings.resolution)),
          y = Math.floor(mouse.y / (window.innerHeight / settings.resolution)),
          px = Math.floor(mouse.px / (window.innerHeight / settings.resolution)),
          py = Math.floor(mouse.py / (window.innerHeight / settings.resolution))

    // add velocity
    fluid.addVelocity(x, y, x - px, y - py)
    fluid.addVelocity(x +1, y, x - px, y - py)
    fluid.addVelocity(x, y +1, x - px, y - py)
    fluid.addVelocity(x +1, y +1, x - px, y - py)

    // add density
    fluid.addDensity(x, y, settings.density)
    fluid.addDensity(x +1, y, settings.density)
    fluid.addDensity(x, y +1, settings.density)
    fluid.addDensity(x +1, y +1, settings.density)
  }

  // update fluid simulation
  if (!settings.pause) fluid.step()

  // request the next frame
  requestAnimationFrame(render)
}

// start the render loop
requestAnimationFrame(render)