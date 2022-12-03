let iterations = 4

class FluidBox {
  /**
   * @description Creates the fluid box object
   * @param {Number} size
   * @param {FluidBox} oldFluidBox
   */
  constructor (size, oldFluidBox) {
    this.size = size // size of the box

    // density
    this.color = [new Array(size * size).fill(0), // color red
                  new Array(size * size).fill(0), // color green
                  new Array(size * size).fill(0)] // color blue

    // density previous step
    this.color0 = [new Array(size * size).fill(0), // color red previous step
                   new Array(size * size).fill(0), // color green previous step
                   new Array(size * size).fill(0)] // color blue previous step

    // velocity
    this.velocity = [new Array(size * size).fill(0), // velocity x
                     new Array(size * size).fill(0)] // velocity y

    // velocity previous step
    this.velocity0 = [new Array(size * size).fill(0), // velocity x
                      new Array(size * size).fill(0)] // velocity y

    // import old fluid box
    if (oldFluidBox) this.import(oldFluidBox)
  }

  /*********************************************\
   *  Code for interacting with the fluid box  *
  \*********************************************/

  /**
   * @description Add color to the box.
   * @param {Number} i - x coordinate
   * @param {Number} j - y coordinate
   * @param {Array<Number>} color - color to add
   */
  addColor (i, j, color) {
    // get the index
    let index = this.index(i, j)

    // add color
    this.color[0][index] += color[0]
    this.color[1][index] += color[1]
    this.color[2][index] += color[2]
  }

  /**
   * @description Adds velocity to the box.
   * @param {Number} i - x coordinate
   * @param {Number} j - y coordinate
   * @param {Number} amountX - amount of velocity in the x direction
   * @param {Number} amountY - amount of velocity in the y direction
   */
  addVelocity (i, j, amountX, amountY) {
    // add velocity to the box

    // get the index
    let index = this.index(i, j)

    // add velocity
    this.velocity[0][index] += amountX * settings.velocityMultiplier
    this.velocity[1][index] += amountY * settings.velocityMultiplier
  }

  /**
   * @description Get the density at a point
   * @param {Number} i - index
   * @returns {Array<Number>}
   */
  getDensity (i) {
    // return RGB array mapping each element color to a value e = e[i] f0r each color channel
    return this.color.map(x => x[i])
  }

  /**
   * @description Steps the simulation forward.
   */
  step () {
    // diffuse velocity
    this.diffuse(1, this.velocity0[0], this.velocity[0], settings.viscosity)
    this.diffuse(2, this.velocity0[1], this.velocity[1], settings.viscosity)

    // project velocity to make it divergence free
    this.project(this.velocity0[0], this.velocity0[1], this.velocity[0], this.velocity[1])

    // advect velocity - move velocity to the next step
    this.advect(1, this.velocity[0], this.velocity0[0], this.velocity0[0], this.velocity0[1])
    this.advect(2, this.velocity[1], this.velocity0[1], this.velocity0[0], this.velocity0[1])

    // get rid of the divergence
    this.project(this.velocity[0], this.velocity[1], this.velocity0[0], this.velocity0[1])

    // diffuse the color
    this.diffuse(0, this.color0[0], this.color[0], settings.diffusion)
    this.diffuse(0, this.color0[1], this.color[1], settings.diffusion)
    this.diffuse(0, this.color0[2], this.color[2], settings.diffusion)

    // advect the color - move color to the next step
    this.advect(0, this.color[0], this.color0[0], this.velocity[0], this.velocity[1])
    this.advect(0, this.color[1], this.color0[1], this.velocity[0], this.velocity[1])
    this.advect(0, this.color[2], this.color0[2], this.velocity[0], this.velocity[1])

    // fade out
    this.fadeOut()
  }

  /*********************************************\
   *          Code for the simulation          *
  \*********************************************/

  /**
   * @description import old fluid box to the new one to make the simulation continuous
   * @param {FluidBox} oldFluidBox
   */
  import (oldFluidBox) {
    if (this.size < oldFluidBox.size) {
      // super sampling
      let factor = oldFluidBox.size / this.size
      for (let j = 0; j < this.size; j++) {
        for (let i = 0; i < this.size; i++) {
          let index = this.index(i, j)

          // average density in the area
          let color = [0, 0, 0]
          let Vx = 0
          let Vy = 0
          for (let jj = 0; jj < factor; jj++) {
            for (let ii = 0; ii < factor; ii++) {
              // color density
              color[0] += oldFluidBox.color[0][this.index(i * factor + ii, j * factor + jj)]
              color[1] += oldFluidBox.color[1][this.index(i * factor + ii, j * factor + jj)]
              color[2] += oldFluidBox.color[2][this.index(i * factor + ii, j * factor + jj)]

              // velocity
              Vx += oldFluidBox.velocity[0][oldFluidBox.index(i * factor + ii, j * factor + jj)]
              Vy += oldFluidBox.velocity[1][oldFluidBox.index(i * factor + ii, j * factor + jj)]
            }
          }

          // set color
          this.color[0][index] = color[0] / (factor * factor)
          this.color[1][index] = color[1] / (factor * factor)
          this.color[2][index] = color[2] / (factor * factor)

          // set velocity
          this.velocity[0][index] = Vx / (factor * factor)
          this.velocity[1][index] = Vy / (factor * factor)
        }
      }
    } else {
      // nearest neighbor
      let factor = this.size / oldFluidBox.size
      for (let j = 0; j < oldFluidBox.size; j++) {
        for (let i = 0; i < oldFluidBox.size; i++) {
          for (let jj = 0; jj < factor; jj++) {
            for (let ii = 0; ii < factor; ii++) {
              let index = this.index(i * factor + ii, j * factor + jj)

              //color density
              this.color[0][index] = oldFluidBox.color[0][oldFluidBox.index(i, j)]
              this.color[1][index] = oldFluidBox.color[1][oldFluidBox.index(i, j)]
              this.color[2][index] = oldFluidBox.color[2][oldFluidBox.index(i, j)]

              //velocity
              this.velocity[0][index] = oldFluidBox.velocity[0][oldFluidBox.index(i, j)]
              this.velocity[1][index] = oldFluidBox.velocity[1][oldFluidBox.index(i, j)]
            }
          }
        }
      }
    }
  }

  /**
   * @description Get the index of a cell
   * @param {Number} i - x coordinate
   * @param {Number} j - y coordinate
   * @returns {Number} - index
   */
  index (i, j) {
    // check if i and j are in the box
    if (i < 0) i = 0
    if (i > this.size - 1) i = this.size - 1
    if (j < 0) j = 0
    if (j > this.size - 1) j = this.size - 1

    // return index
    return i + j * this.size
  }

  /**
   * @description Advection step of the simulation - move the fluid to the next step
   * @param b - boundary condition
   * @param d - density
   * @param d0 - old density
   * @param vX - x velocity
   * @param vY - y velocity
   */
  advect (b, d, d0, vX, vY) {
    // calculate the time step
    let dtx = settings.dt * (this.size - 2)
    let dty = settings.dt * (this.size - 2)

    // variables for the interpolation
    let i0, i1, j0, j1   // the four corners of the cell
    let s0, s1, t0, t1   // the interpolation weights
    let tmp1, tmp2, x, y // temporary variables

    // iterate over all cells
    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        // calculate the position of the cell
        tmp1 = dtx * vX[this.index(i, j)]
        tmp2 = dty * vY[this.index(i, j)]

        // calculate the position of the cell in the previous frame
        x = i - tmp1
        y = j - tmp2

        // clamp the position
        // clamp the x position
        if (x < 0.5) x = 0.5
        if (x > this.size + 0.5) x = this.size + 0.5
        i0 = Math.floor(x)
        i1 = i0 + 1.0

        // clamp the y position
        if (y < 0.5) y = 0.5
        if (y > this.size + 0.5) y = this.size + 0.5
        j0 = Math.floor(y)
        j1 = j0 + 1.0

        // calculate the interpolation weights
        s1 = x - i0
        s0 = 1.0 - s1
        t1 = y - j0
        t0 = 1.0 - t1

        // interpolate the value
        let i0i = i0
        let i1i = i1
        let j0i = j0
        let j1i = j1

        // set the value
        d[this.index(i, j)] =
          s0 * (t0 * d0[this.index(i0i, j0i)] + t1 * d0[this.index(i0i, j1i)]) +
          s1 * (t0 * d0[this.index(i1i, j0i)] + t1 * d0[this.index(i1i, j1i)])
      }
    }
    // set the boundary conditions
    this.setBoundary(b, d)
  }

  /**
   * @description Diffusion step of the simulation - diffuse the fluid
   * @param b - boundary condition
   * @param x - density
   * @param x0 - old density
   * @param diff - diffusion rate
   */
  diffuse (b, x, x0, diff) {
    // calculate the diffusion rate
    let a = settings.dt * diff * (this.size - 2) * (this.size - 2)
    // pass the diffusion rate to the linear solver
    this.linearSolve(b, x, x0, a, 1 + 4 * a)
  }

  /**
   * @description Projection step of the simulation - project the velocity field
   * @param vX  - x velocity
   * @param vY  - y velocity
   * @param p   - pressure
   * @param div - divergence
   */
  project (vX, vY, p, div) {
    // calculate the divergence
    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        div[this.index(i, j)] = -0.5 * (vX[this.index(i + 1, j)] - vX[this.index(i - 1, j)] + vY[this.index(i, j + 1)] - vY[this.index(i, j - 1)]) / this.size
        p[this.index(i, j)] = 0
      }
    }

    // set the boundary conditions
    this.setBoundary(0, div)
    this.setBoundary(0, p)

    // solve the pressure
    this.linearSolve(0, p, div, 1, 4)

    // subtract the gradient of the pressure from the velocity
    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        vX[this.index(i, j)] -= 0.5 * (p[this.index(i + 1, j)] - p[this.index(i - 1, j)]) * this.size
        vY[this.index(i, j)] -= 0.5 * (p[this.index(i, j + 1)] - p[this.index(i, j - 1)]) * this.size
      }
    }

    // set the boundary conditions
    this.setBoundary(1, vX)
    this.setBoundary(2, vY)
  }

  /**
   * @description Fades the density of the fluid to black over time
   */
  fadeOut () {
    // fade out the color

    // get the fade out factor
    let fade = 1 - settings.fadeout * settings.dt

    // fade out for each cell
    for (let i = 0; i < this.size * this.size; i++) {
      // fade out each color channel
      this.color[0][i] *= fade
      this.color[1][i] *= fade
      this.color[2][i] *= fade
    }
  }

  /**
   * @description Linear solver for the diffusion and projection step
   * @param b  - boundary condition
   * @param x  - value
   * @param x0 - value from the previous step
   * @param a  - constant a
   * @param c  - constant c
   *
   * https://en.wikipedia.org/wiki/Gauss%E2%80%93Seidel_method
   * https://en.wikipedia.org/wiki/Tridiagonal_matrix_algorithm
   * https://en.wikipedia.org/wiki/Tridiagonal_matrix
   */
  linearSolve (b, x, x0, a, c) {
    // reciprocal of c
    let cRecip = 1.0 / c

    // iterate
    for (let k = 0; k < iterations; k++) {
      // over all cells
      for (let j = 1; j < this.size - 1; j++) {
        for (let i = 1; i < this.size - 1; i++) {
          // calculate the value of the cell
          x[this.index(i, j)] =
            (x0[this.index(i, j)] // previous value
              + a *
              (x[this.index(i + 1, j)] // right
                + x[this.index(i - 1, j)] // left
                + x[this.index(i, j + 1)] // top
                + x[this.index(i, j - 1)] // bottom
              )) * cRecip // multiply by reciprocal of c
        }
      }

      // subroutine boundary conditions
      this.setBoundary(b, x)
    }
  }

  /**
   * @description Boundary conditions for the simulation
   * @param b - boundary condition
   * @param x - value
   */
  setBoundary (b, x) {
    // set the boundary conditions for the array x
    for (let i = 1; i < this.size - 1; i++) {
      x[this.index(i, 0)] = b === 2 ? -x[this.index(i, 1)] : x[this.index(i, 1)]
      x[this.index(i, this.size - 1)] = b === 2 ? -x[this.index(i, this.size - 2)] : x[this.index(i, this.size - 2)]
    }

    // set the boundary conditions for the array x
    for (let j = 1; j < this.size - 1; j++) {
      x[this.index(0, j)] = b === 1 ? -x[this.index(1, j)] : x[this.index(1, j)]
      x[this.index(this.size - 1, j)] = b === 1 ? -x[this.index(this.size - 2, j)] : x[this.index(this.size - 2, j)]
    }

    // set the boundary conditions for the array x
    x[this.index(0, 0)] = 0.5 * (x[this.index(1, 0)] + x[this.index(0, 1)])
    x[this.index(0, this.size - 1)] = 0.5 * (x[this.index(1, this.size - 1)] + x[this.index(0, this.size - 2)])
    x[this.index(this.size - 1, 0)] = 0.5 * (x[this.index(this.size - 2, 0)] + x[this.index(this.size - 1, 1)])
    x[this.index(this.size - 1, this.size - 1)] = 0.5 * (x[this.index(this.size - 2, this.size - 1)] + x[this.index(this.size - 1, this.size - 2)])
  }
}