let iterations = 4

class FluidBox {
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

  index (i, j) {
    if (i < 0) i = 0
    if (i > this.size - 1) i = this.size - 1
    if (j < 0) j = 0
    if (j > this.size - 1) j = this.size - 1

    return i + j * this.size
  }

  addColor (i, j, color) {
    let index = this.index(i, j)
    this.color[0][index] += color[0]
    this.color[1][index] += color[1]
    this.color[2][index] += color[2]
  }

  addDensity (i, j, color) {
    let index = this.index(i, j)

    color = color.map(x => Math.floor(x * settings.density / 255))

    this.color[0][index] += color[0]
    this.color[1][index] += color[1]
    this.color[2][index] += color[2]
  }

  getDensity (i) {
    return this.color.map(x => x[i])
  }

  addVelocity (i, j, amountX, amountY) {
    let index = this.index(i, j)
    this.velocity[0][index] += amountX * settings.velocityMultiplier
    this.velocity[1][index] += amountY * settings.velocityMultiplier
  }

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

  fadeOut () {
    for (let i = 0; i < this.size * this.size; i++) {
      let fade = 1 - settings.fadeout * settings.dt
      // fade out relative to dt
      this.color[0][i] *= fade
      this.color[1][i] *= fade
      this.color[2][i] *= fade
    }
  }

  // diffuse - make the x spread out inside the box
  diffuse (b, x, x0, diff) {
    // diffuse the array x with the array x0
    // b is the boundary condition
    // diff is the diffusion rate

    // calculate the diffusion rate
    let a = settings.dt * diff * (this.size - 2) * (this.size - 2)
    // pass the diffusion rate to the linear solver
    this.linearSolve(b, x, x0, a, 1 + 4 * a)
  }

  // linear solve - solves the equation Ax = b
  linearSolve (b, x, x0, a, c) {
    // we need to solve Ax = b
    // where A is a tridiagonal matrix
    // and x and b are vectors
    // and x0 is the previous x
    // and a and c are constants representing the matrix
    // we use Gauss-Seidel method
    // https://en.wikipedia.org/wiki/Gauss%E2%80%93Seidel_method
    // https://en.wikipedia.org/wiki/Tridiagonal_matrix_algorithm
    // https://en.wikipedia.org/wiki/Tridiagonal_matrix

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

  // set boundary - Check fluid doesn't escape the box by mirroring the values
  setBoundary (b, x) {
    // boundary conditions
    // b is the boundary condition
    // x is the array to apply the boundary conditions to

    for (let i = 1; i < this.size - 1; i++) {
      x[this.index(i, 0)] = b === 2 ? -x[this.index(i, 1)] : x[this.index(i, 1)]
      x[this.index(i, this.size - 1)] = b === 2 ? -x[this.index(i, this.size - 2)] : x[this.index(i, this.size - 2)]
    }

    for (let j = 1; j < this.size - 1; j++) {
      x[this.index(0, j)] = b === 1 ? -x[this.index(1, j)] : x[this.index(1, j)]
      x[this.index(this.size - 1, j)] = b === 1 ? -x[this.index(this.size - 2, j)] : x[this.index(this.size - 2, j)]
    }

    x[this.index(0, 0)] = 0.5 * (x[this.index(1, 0)] + x[this.index(0, 1)])
    x[this.index(0, this.size - 1)] = 0.5 * (x[this.index(1, this.size - 1)] + x[this.index(0, this.size - 2)])
    x[this.index(this.size - 1, 0)] = 0.5 * (x[this.index(this.size - 2, 0)] + x[this.index(this.size - 1, 1)])
    x[this.index(this.size - 1, this.size - 1)] = 0.5 * (x[this.index(this.size - 2, this.size - 1)] + x[this.index(this.size - 1, this.size - 2)])
  }

  project (vX, vY, p, div) {
    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        div[this.index(i, j)] = -0.5 * (vX[this.index(i + 1, j)] - vX[this.index(i - 1, j)] + vY[this.index(i, j + 1)] - vY[this.index(i, j - 1)]) / this.size
        p[this.index(i, j)] = 0
      }
    }
    this.setBoundary(0, div)
    this.setBoundary(0, p)
    this.linearSolve(0, p, div, 1, 4)

    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        vX[this.index(i, j)] -= 0.5 * (p[this.index(i + 1, j)] - p[this.index(i - 1, j)]) * this.size
        vY[this.index(i, j)] -= 0.5 * (p[this.index(i, j + 1)] - p[this.index(i, j - 1)]) * this.size
      }
    }
    this.setBoundary(1, vX)
    this.setBoundary(2, vY)
  }

  advect (b, d, d0, vX, vY) {
    let i0, i1, j0, j1

    let dtx = settings.dt * (this.size - 2)
    let dty = settings.dt * (this.size - 2)

    let s0, s1, t0, t1
    let tmp1, tmp2, x, y

    let i, j

    for (j = 1; j < this.size - 1; j++) {
      for (i = 1; i < this.size - 1; i++) {
        tmp1 = dtx * vX[this.index(i, j)]
        tmp2 = dty * vY[this.index(i, j)]
        x = i - tmp1
        y = j - tmp2

        if (x < 0.5) x = 0.5
        if (x > this.size + 0.5) x = this.size + 0.5
        i0 = Math.floor(x)
        i1 = i0 + 1.0

        if (y < 0.5) y = 0.5
        if (y > this.size + 0.5) y = this.size + 0.5
        j0 = Math.floor(y)
        j1 = j0 + 1.0

        s1 = x - i0
        s0 = 1.0 - s1
        t1 = y - j0
        t0 = 1.0 - t1

        let i0i = i0
        let i1i = i1
        let j0i = j0
        let j1i = j1

        d[this.index(i, j)] =
          s0 * (t0 * d0[this.index(i0i, j0i)] + t1 * d0[this.index(i0i, j1i)]) +
          s1 * (t0 * d0[this.index(i1i, j0i)] + t1 * d0[this.index(i1i, j1i)])
      }
    }
    this.setBoundary(b, d)
  }
}