# Boids Simulation 3D

Three-dimensional implementation of the Boids flocking algorithm. It simulates the collective behavior of entities using simple local rules, rendered in a 3D environment using React and Three.js.

Live Demo: [https://urmumfat.github.io/boids-simulation-3d/](https://urmumfat.github.io/boids-simulation-3d/)

## Features

* **Real-time Control**: Adjust simulation parameters including separation, alignment, cohesion, and speed limits through a dedicated overlay.
* **Environmental Interactions**:
    * **Obstacles**: Boids detect and navigate around spherical obstacles placed in the environment.
    * **Predators**: Specialized entities that hunt boids, triggering a flee response in the flock.
    * **Species Division**: Option to split the flock into distinct species that only interact with their own kind for cohesion and alignment.
* **Performance Optimization**: Uses Three.js instanced rendering (instancedMesh) to efficiently simulate up to 2,000 entities.
* **Educational Sidebar**: An integrated panel displays the mathematical formulas governing the simulation, such as 3D Euclidean distance and velocity integration.

## Requirements

* Node.js (version 16.0 or newer)
* npm (Node Package Manager)

## Getting Started

Follow these steps to download, configure, and run the simulation locally:

```bash
# 1. Clone the repository
git clone [https://github.com/urmumfat/boids-simulation-3d.git](https://github.com/urmumfat/boids-simulation-3d.git)

# 2. Navigate to the project directory
cd boids-simulation-3d

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev