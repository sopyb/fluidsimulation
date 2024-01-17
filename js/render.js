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

// ! General Events

function translatePos(object) {
    // calculate position in canvas
    return {
        x: Math.floor(object.x / (window.innerHeight / settings.resolution)),
        y: Math.floor(object.y / (window.innerHeight / settings.resolution)),
        px: Math.floor(object.px / (window.innerHeight / settings.resolution)),
        py: Math.floor(object.py / (window.innerHeight / settings.resolution))
    }
}

function fluidInteract({x, y, px, py}) {
    // add velocity
    fluid.addVelocity(x, y, x - px, y - py)
    fluid.addVelocity(x + 1, y, x - px, y - py)
    fluid.addVelocity(x, y + 1, x - px, y - py)
    fluid.addVelocity(x + 1, y + 1, x - px, y - py)

    // add color
    fluid.addColor(x, y, settings.color)
    fluid.addColor(x + 1, y, settings.color)
    fluid.addColor(x, y + 1, settings.color)
    fluid.addColor(x + 1, y + 1, settings.color)
}

// ! Mouse events

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

let clearMouse = () => {
    mouse.down = false

    // clear mouse position
    mouse.x = -1
    mouse.y = -1
    mouse.px = -1
    mouse.py = -1
}

// on mouseup
canvas.addEventListener('mouseup', clearMouse)

// on mouseleave
canvas.addEventListener('mouseleave', clearMouse)

// ! Touch events

let touches = []

// on touchstart
canvas.addEventListener('touchstart', e => {
    e.preventDefault()

    let Ttouches = e.targetTouches
    // loop through touches
    for (let i = 0; i < Ttouches.length; i++) {
        let touch = Ttouches[i]

        // add touch to array
        touches.push({
            id: touch.identifier,
            x: touch.pageX,
            y: touch.pageY,
            px: touch.pageX,
            py: touch.pageY
        })
    }
})

// on touchmove
canvas.addEventListener('touchmove', e => {
    e.preventDefault()

    let Ttouches = e.targetTouches

    // loop through touches
    for (let i = 0; i < Ttouches.length; i++) {
        let touch = Ttouches[i]

        // find touch in array
        for (let j = 0; j < touches.length; j++) {
            if (touches[j].id === touch.identifier) {
                // update px and py
                touches[j].px = touches[j].x
                touches[j].py = touches[j].y

                // set touch position
                touches[j].x = touch.pageX
                touches[j].y = touch.pageY
            }
        }
    }
})

let removeTouchEvent = (e) => {
    let Ttouches = e.changedTouches

    // loop through touches
    for (let i = 0; i < Ttouches.length; i++) {
        let touch = Ttouches[i]

        // find touch in array
        for (let j = 0; j < touches.length; j++) {
            if (touches[j].id === touch.identifier) {
                // remove touch from array
                touches.splice(j, 1)
            }
        }
    }
}

// on touchend
canvas.addEventListener('touchend', removeTouchEvent)

// on touchcancel
canvas.addEventListener('touchcancel', removeTouchEvent)

/**************************************************************************\
 *               Rendering the fluid simulation on the canvas             *
 \**************************************************************************/

function render() {
    // mouse interaction
    if (mouse.down) fluidInteract(translatePos(mouse))

    // touch interaction
    for (let i = 0; i < touches.length; i++) fluidInteract(translatePos(touches[i]))

    // get densities for all pixels once before the loop
    let densities = Array.from({length: settings.resolution * settings.resolution}, (_, i) => fluid.getDensity(i));
    let imageData = ctx.getImageData(0, 0, settings.resolution, settings.resolution);
    let data = imageData.data;

    for (let i = 0; i < settings.resolution * settings.resolution; i++) {
        let x = i % settings.resolution,
            y = Math.floor(i / settings.resolution),
            d = densities[i];

        if (d.some(v => v > 255)) {
            let max = Math.max(d[0], d[1], d[2]);
            d[0] = d[0] / max * 255;
            d[1] = d[1] / max * 255;
            d[2] = d[2] / max * 255;
        }

        let index = (y * settings.resolution + x) * 4;
        data[index] = d[0];     // R
        data[index + 1] = d[1]; // G
        data[index + 2] = d[2]; // B
        data[index + 3] = 255;  // A
    }

    ctx.putImageData(imageData, 0, 0);

    // update fluid simulation
    if (!settings.pause) fluid.step()

    // request the next frame
    requestAnimationFrame(render)
}

// start the render loop
requestAnimationFrame(render)