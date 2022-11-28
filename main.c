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

int main() {
  //initialize GLFW
  if (!glfwInit()) {
	fprintf(stderr, "Failed to initialize GLFW");
	return -1;
  }

  // set OpenGL version to 4.7
  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
  // set OpenGL profile to core
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
  // set OpenGL forward compatibility
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);


  // create a window
  GLFWwindow *window = glfwCreateWindow(640, 480, "Hello World", NULL, NULL);
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

	// clear the screen to black
	glClearColor(1.0f, 1.0f, 0.0f, 1.0f);

	// draw
	glClear(GL_COLOR_BUFFER_BIT);

	// swap buffers
	glfwSwapBuffers(window);
  }

  // terminate GLFW
  glfwTerminate();
  return 0;
}
