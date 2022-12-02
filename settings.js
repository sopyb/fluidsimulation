let settings = {
  resolution: 128,
  viscosity: 0.01,
  dt: 0.1,
  density: 1,
  velocityMultiplier: 1
}

// get select #resolution and it's label
const resolutionSelect = document.querySelector('#resolution');
const resolutionLabel = document.querySelector('label[for=resolution]');


// get input #viscosity and it's label
const viscosityInput = document.querySelector('#viscosity');
const viscosityValue = document.querySelector('#viscosity-value');

// get input #dt and it's label
const dtInput = document.querySelector('#dt');
const dtValue = document.querySelector('#dt-value');

// get input #density and it's label
const densityInput = document.querySelector('#density');
const densityValue = document.querySelector('#density-value');

// get input #velocityMultiplier and it's label
const velocityMultiplierInput = document.querySelector('#velocity');
const velocityMultiplierValue = document.querySelector('#velocity-value');

// get button #reset
const resetButton = document.querySelector('#reset');

// get settings from localStorage if they exist
if (localStorage.getItem('settings')) {
  let savedSettings;

  try {
    savedSettings = JSON.parse(localStorage.getItem('settings'));
  } catch (e) {
    // clear localStorage if it's corrupted
    localStorage.clear();
  }

  // set select #resolution
  resolutionSelect.value = savedSettings.resolution || settings.resolution;

  // set input #viscosity
  viscosityInput.value = savedSettings.viscosity || settings.viscosity;

  // set input #dt
  dtInput.value = savedSettings.dt || settings.dt;

  // set input #density
  densityInput.value = savedSettings.density || settings.density;

  // set input #velocityMultiplier
  velocityMultiplierInput.value = savedSettings.velocityMultiplier || settings.velocityMultiplier;
} else {
  // set select #resolution
  resolutionSelect.value = settings.resolution;

  // set input #viscosity
  viscosityInput.value = settings.viscosity;

  // set input #dt
  dtInput.value = settings.dt;

  // set input #density
  densityInput.value = settings.density;

  // set input #velocityMultiplier
  velocityMultiplierInput.value = settings.velocityMultiplier;
}

// update labels and values
resolutionLabel.innerHTML = "Resolution: " + resolutionSelect.value;
viscosityValue.innerHTML = parseFloat(viscosityInput.value).toFixed(2);
dtValue.innerHTML = parseFloat(dtInput.value).toFixed(2);
densityValue.innerHTML = parseFloat(densityInput.value).toFixed(2);
velocityMultiplierValue.innerHTML = parseFloat(velocityMultiplierInput.value).toFixed(2);

// add event listener to select #resolution
resolutionSelect.addEventListener('change', (e) => {
  settings.resolution = parseFloat(e.target.value);
  resolutionLabel.innerHTML = `Resolution: ${settings.resolution}`;
  localStorage.setItem('settings', JSON.stringify(settings));
})

// add event listener to input #viscosity
viscosityInput.addEventListener('input', (e) => {
  settings.viscosity = parseFloat(e.target.value);
  viscosityValue.innerHTML = settings.viscosity.toFixed(2);
  localStorage.setItem('settings', JSON.stringify(settings));
})

// add event listener to input #dt
dtInput.addEventListener('input', (e) => {
  settings.dt = parseFloat(e.target.value);
  dtValue.innerHTML = settings.dt.toFixed(2);
  localStorage.setItem('settings', JSON.stringify(settings));
})

// add event listener to input #density
densityInput.addEventListener('input', (e) => {
  settings.density = parseFloat(e.target.value);
  densityValue.innerHTML = settings.density.toFixed(2);
  localStorage.setItem('settings', JSON.stringify(settings));
})

// add event listener to input #velocityMultiplier
velocityMultiplierInput.addEventListener('input', (e) => {
  settings.velocityMultiplier = parseFloat(e.target.value);
  velocityMultiplierValue.innerHTML = settings.velocityMultiplier.toFixed(2);
  localStorage.setItem('settings', JSON.stringify(settings));
})

// add event listener to button #reset
resetButton.addEventListener('click', () => {
  localStorage.removeItem('settings');
  location.reload();
})