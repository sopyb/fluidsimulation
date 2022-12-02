let settings = {
  resolution: 64,
  viscosity: 0.0001,
  diffusion: 0.001,
  fadeout: 0.01,
  dt: 0.1,
  density: 255,
  velocityMultiplier: 1,
}

let updateCallback = () => {}

// get select #resolution and it's label
const resolutionSelect = document.querySelector('#resolution')
const resolutionLabel = document.querySelector('label[for=resolution]')

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

// get button #reset
const resetButton = document.querySelector('#reset')

// get settings from localStorage if they exist
if (localStorage.getItem('settings')) {
  try {
    let savedSettings = JSON.parse(localStorage.getItem('settings'))

    settings.resolution = savedSettings.resolution ?? settings.resolution
    settings.viscosity = savedSettings.viscosity ?? settings.viscosity
    settings.diffusion = savedSettings.diffusion ?? settings.diffusion
    settings.fadeout = savedSettings.fadeout ?? settings.fadeout
    settings.dt = savedSettings.dt ?? settings.dt
    settings.density = savedSettings.density ?? settings.density
    settings.velocityMultiplier = savedSettings.velocityMultiplier ?? settings.velocityMultiplier
  } catch (e) {
    // clear localStorage if it's corrupted
    localStorage.clear()
  }
}

// set select #resolution
resolutionSelect.value = settings.resolution

// set input #viscosity
viscosityInput.value = settings.viscosity * 100

// set input #diffusion
diffusionInput.value = settings.diffusion * 10

// set input #fadeout
fadeoutInput.value = settings.fadeout

// set input #dt
dtInput.value = settings.dt

// set input #density
densityInput.value = settings.density


// set input #velocityMultiplier
velocityMultiplierInput.value = settings.velocityMultiplier

// update labels and values
resolutionLabel.innerHTML = 'Resolution: ' + resolutionSelect.value
viscosityValue.innerHTML = (parseFloat(viscosityInput.value)/100).toFixed(4)
diffusionValue.innerHTML = (parseFloat(diffusionInput.value)/10).toFixed(3)
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

// add event listener to input #viscosity
viscosityInput.addEventListener('input', (e) => {
  settings.viscosity = parseFloat(e.target.value) / 100
  viscosityValue.innerHTML = settings.viscosity.toFixed(4)
  localStorage.setItem('settings', JSON.stringify(settings))
})

// add event listener to input #diffusion
diffusionInput.addEventListener('input', (e) => {
  settings.diffusion = parseFloat(e.target.value) / 10
  diffusionValue.innerHTML = settings.diffusion.toFixed(3)
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

// add event listener to button #reset
resetButton.addEventListener('click', () => {
  localStorage.removeItem('settings')
  location.reload()
})