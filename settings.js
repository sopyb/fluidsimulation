// Util fuctions
function hexToRgb (hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ]
}

// settings stuff
let settings = {
  resolution: 64, // resolution of the fluid simulation
  dt: 0.1, // time step
  density: 255, // dye density
  color: [255, 255, 255], // dye color
  diffusion: 0.001, // dye diffusion rate
  fadeout: 0.01, // dye fadeout
  viscosity: 0.0001, // fluid viscosity
  velocityMultiplier: 1, // velocity multiplier
  pixelated: false, // pixelated rendering
  pause: false, // pause simulation
}

let updateCallback = () => {}

// get select #resolution and it's label
const resolutionSelect = document.querySelector('#resolution')
const resolutionLabel = document.querySelector('label[for=resolution]')

// get select #color and it's label
let colorSelect = document.querySelector('#color')
let colorLabel = document.querySelector('#color-value')

// get input #viscosity and it's label
const viscosityInput = document.querySelector('#viscosity')
const viscosityValue = document.querySelector('#viscosity-value')

// get input #diffusion and it's label
const diffusionInput = document.querySelector('#diffusion')
const diffusionValue = document.querySelector('#diffusion-value')

// get input #fadeout and it's label
const fadeoutInput = document.querySelector('#fadeout')
const fadeoutValue = document.querySelector('#fadeout-value')

// get input #dt and it's label
const dtInput = document.querySelector('#dt')
const dtValue = document.querySelector('#dt-value')

// get input #density and it's label
const densityInput = document.querySelector('#density')
const densityValue = document.querySelector('#density-value')

// get input #velocityMultiplier and it's label
const velocityMultiplierInput = document.querySelector('#velocity')
const velocityMultiplierValue = document.querySelector('#velocity-value')

// get input #pixelated
const pixelatedInput = document.querySelector('#pixelated')

// get button #reset
const resetButton = document.querySelector('#reset')

// get button #pause
const pauseButton = document.querySelector('#pause')

// get settings from localStorage if they exist
if (localStorage.getItem('settings')) {
  try {
    let savedSettings = JSON.parse(localStorage.getItem('settings'))

    settings.resolution = savedSettings.resolution ?? settings.resolution
    settings.color = savedSettings.color ?? settings.color
    settings.viscosity = savedSettings.viscosity ?? settings.viscosity
    settings.diffusion = savedSettings.diffusion ?? settings.diffusion
    settings.fadeout = savedSettings.fadeout ?? settings.fadeout
    settings.dt = savedSettings.dt ?? settings.dt
    settings.density = savedSettings.density ?? settings.density
    settings.velocityMultiplier = savedSettings.velocityMultiplier ?? settings.velocityMultiplier
    settings.pixelated = savedSettings.pixelated ?? settings.pixelated
    settings.pause = savedSettings.pause ?? settings.pause
  } catch (e) {
    // clear localStorage if it's corrupted
    localStorage.clear()

    // save settings to localStorage
    localStorage.setItem('settings', JSON.stringify(settings))

    // announce error
    alert('Error: Saved settings are corrupted. Settings have been reset.')

    // log error
    console.error(e)
  }
}

// set select #resolution
resolutionSelect.value = settings.resolution

// set select #color converting the array to a hex string
colorSelect.value = '#' + settings.color.map(c => c.toString(16).padStart(2, "0")).join('')

// set input #viscosity
viscosityInput.value = settings.viscosity * 100

// set input #diffusion
diffusionInput.value = settings.diffusion * 100

// set input #fadeout
fadeoutInput.value = settings.fadeout

// set input #dt
dtInput.value = settings.dt

// set input #density
densityInput.value = settings.density

// set input #velocityMultiplier
velocityMultiplierInput.value = settings.velocityMultiplier

// set button #pause
pauseButton.innerText = settings.pause ? 'Resume' : 'Pause'

// update labels and values
resolutionLabel.innerHTML = 'Resolution: ' + resolutionSelect.value
colorLabel.innerHTML = colorSelect.value.toUpperCase()
viscosityValue.innerHTML = (parseFloat(viscosityInput.value) / 100).toFixed(4)
diffusionValue.innerHTML = (parseFloat(diffusionInput.value) / 100).toFixed(4)
fadeoutValue.innerHTML = parseFloat(fadeoutInput.value).toFixed(2)
dtValue.innerHTML = parseFloat(dtInput.value).toFixed(2)
densityValue.innerHTML = parseFloat(densityInput.value).toFixed(2)
velocityMultiplierValue.innerHTML = parseFloat(velocityMultiplierInput.value).toFixed(2)
updateCallback()

// add event listener to select #resolution
resolutionSelect.addEventListener('change', (e) => {
  settings.resolution = parseInt(e.target.value)
  resolutionLabel.innerHTML = `Resolution: ${settings.resolution}`
  localStorage.setItem('settings', JSON.stringify(settings))

  updateCallback()
})

// add event listener to select #color
colorSelect.addEventListener('change', (e) => {
  settings.color = hexToRgb(e.target.value)
  colorLabel.innerHTML = e.target.value.toUpperCase()
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #viscosity
viscosityInput.addEventListener('input', (e) => {
  settings.viscosity = parseFloat(e.target.value) / 100
  viscosityValue.innerHTML = settings.viscosity.toFixed(4)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #diffusion
diffusionInput.addEventListener('input', (e) => {
  settings.diffusion = parseFloat(e.target.value) / 100
  diffusionValue.innerHTML = settings.diffusion.toFixed(4)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #fadeout
fadeoutInput.addEventListener('input', (e) => {
  settings.fadeout = parseFloat(e.target.value)
  fadeoutValue.innerHTML = settings.fadeout.toFixed(2)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #dt
dtInput.addEventListener('input', (e) => {
  settings.dt = parseFloat(e.target.value)
  dtValue.innerHTML = settings.dt.toFixed(2)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #density
densityInput.addEventListener('input', (e) => {
  settings.density = parseFloat(e.target.value)
  densityValue.innerHTML = settings.density.toFixed(2)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #velocityMultiplier
velocityMultiplierInput.addEventListener('input', (e) => {
  settings.velocityMultiplier = parseFloat(e.target.value)
  velocityMultiplierValue.innerHTML = settings.velocityMultiplier.toFixed(2)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #pixelated
pixelatedInput.addEventListener('change', (e) => {
  settings.pixelated = e.target.checked
  localStorage.setItem('settings', JSON.stringify(settings))

  // find #render canvas
  const renderCanvas = document.querySelector('#render')
  // set image-rendering style
  renderCanvas.style.imageRendering = settings.pixelated ? 'pixelated' : 'auto'

  updateCallback()
})

// add event listener to button #reset
resetButton.addEventListener('click', () => {
  localStorage.removeItem('settings')
  location.reload()
})

// add event listener to button #pause
pauseButton.addEventListener('click', () => {
  settings.pause = !settings.pause
  pauseButton.innerText = settings.pause ? 'Resume' : 'Pause'
  localStorage.setItem('settings', JSON.stringify(settings))
})