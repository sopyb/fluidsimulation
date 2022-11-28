/*********************************************************************\
 *                           FluidSimulator                          *
 * 					                                                 *
 * 		   Author - Sopy <contact@sopy.one>      				     *
 * 	  Description - Allows you to create colorful fluid simulations. *
 * 	      License - GNU General Public License v3.0                  *
 *   	  Website - https://sopy.one/ 		                         *
 *         GitHub - sopyb/FluidSimulator                             *
 * 	      Version - 0.0.1                                            *
 * 	         Date - 2022-11-28                                       *
 * 	         												   	     *
 ? 	         Note - This is a work in progress.                      ?
 ?                  Hopefully, I will be able to finish it.          ?
 * 	         												   	     *
\*********************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
//include GLAD before GLFW
#include <glad/glad.h>
#include <GLFW/glfw3.h>

// cell struct
typedef struct {
  int x, y;
  float vx, vy;
  float density;
  float color[3];
} cell;

int main() {
  cell *cells[800];

  // mall alloc pointer to array of cells
  for (int i = 0; i < 800; i++) {
	cells[i] = (cell *) malloc(600 * sizeof(cell));
  }

  // set cell values
  for (int i = 0; i < 800; i++) {
	for (int j = 0; j < 600; j++) {
	  cells[i][j].x = i;
	  cells[i][j].y = j;
	  cells[i][j].vx = 0;
	  cells[i][j].vy = 0;
	  cells[i][j].density = 0;
	  cells[i][j].color[0] = 0;
	  cells[i][j].color[1] = 0;
	  cells[i][j].color[2] = 0;

	  // if pixel is in the center of the screen
	  if (i == 400 && j == 300) {
		cells[i][j].density = 256.0F;
		cells[i][j].color[0] = 1.0F;
		cells[i][j].color[1] = 1.0F;
		cells[i][j].color[2] = 1.0F;
	  }
	}
  }

  //initialize GLFW
  if (!glfwInit()) {
	fprintf(stderr, "Failed to initialize GLFW");
	return -1;
  }

  // set OpenGL version to 4.6
  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
  // set OpenGL profile to compatibility
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_COMPAT_PROFILE);
  // set OpenGL forward compatibility
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);


  // create a window
  GLFWwindow *window = glfwCreateWindow(800, 600, "Hello World", NULL, NULL);
  // lock window size
  glfwSetWindowSizeLimits(window, 800, 600, 800, 600);

  // mouse cursor
  double xpos, ypos;

  // check if window was created
  if (window == NULL) {
	fprintf(stderr, "Failed to create GLFW window");
	glfwTerminate();
	return -1;
  }

  // make the window's context current
  glfwMakeContextCurrent(window);
  gladLoadGL();

  // stop program if window is closed
  while (!glfwWindowShouldClose(window)) {
	// check for events
	glfwPollEvents();

	// clear the color buffer
	glClear(GL_COLOR_BUFFER_BIT);

	// draw every cell
	for (int i = 0; i < 800; i++) {
	  for (int j = 0; j < 600; j++) {
		// set alpha value density/256
		glColor4f(cells[i][j].color[0], cells[i][j].color[1], cells[i][j].color[2], cells[i][j].density / 256.0F);

		// draw pixel
		glBegin(GL_POINTS);
		glVertex2i(cells[i][j].x, cells[i][j].y);
		glEnd();


	  }
	}
	// get mouse input if mouse is down
	if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS) {
	  glfwGetCursorPos(window, &xpos, &ypos);
	  printf("Mouse clicked at %f, %f\n", xpos, ypos);

	  // add density to cell
	  cells[(int) xpos][(int) ypos].density = 256.0F;

	  // add color to cell
	  cells[(int) xpos][(int) ypos].color[0] = 1;
	  cells[(int) xpos][(int) ypos].color[1] = 1;
	  cells[(int) xpos][(int) ypos].color[2] = 1;
	}

	// swap buffers
	glfwSwapBuffers(window);

	// diffuse density
	for (int i = 0; i < 800; i++) {
	  for (int j = 0; j < 600; j++) {
		// check if cell is not on edge
		if (i != 0 && i != 799 && j != 0 && j != 599) {
		  // diffuse density
		  cells[i][j].density =
			  (cells[i][j].density +
				  cells[i + 1][j].density +
				  cells[i - 1][j].density +
				  cells[i][j + 1].density +
				  cells[i][j - 1].density) / 5;

		  // diffuse color
		  cells[i][j].color[0] =
			  (cells[i][j].color[0] +
				  cells[i + 1][j].color[0] +
				  cells[i - 1][j].color[0] +
				  cells[i][j + 1].color[0] +
				  cells[i][j - 1].color[0]) / 5;

		  cells[i][j].color[1] =
			  (cells[i][j].color[1] +
				  cells[i + 1][j].color[1] +
				  cells[i - 1][j].color[1] +
				  cells[i][j + 1].color[1] +
				  cells[i][j - 1].color[1]) / 5;

		  cells[i][j].color[2] =
			  (cells[i][j].color[2] +
				  cells[i + 1][j].color[2] +
				  cells[i - 1][j].color[2] +
				  cells[i][j + 1].color[2] +
				  cells[i][j - 1].color[2]) / 5;
		}
	  }
	}
//	// print matrix of densities
//	 for (int i = 0; i < 800; i++) {
//	   for (int j = 0; j < 600; j++) {
//	 	printf("%f ", cells[i][j].density);
//	   }
//	   printf("\n");
//	 }
  }

  // terminate GLFW
  glfwTerminate();
  return 0;
}
