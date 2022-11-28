cmake_minimum_required(VERSION 3.23)
project(FluidSimulation C)

# Set the C standard to C99
set(CMAKE_C_STANDARD 99)

# add glad.c to the project to the include directories
add_library(glad STATIC ${CMAKE_CURRENT_SOURCE_DIR}/include/glad/src/glad.c)
target_include_directories(glad PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# include glad.h in the project
target_include_directories(glad PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include/glad/include)

# build glfw by their own CMakeLists.txt
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/include/glfw)

# add the executable
add_executable(FluidSimulation main.c)

# link the libraries
target_link_libraries(FluidSimulation glad glfw)

# link other libraries
target_link_libraries(FluidSimulation m)