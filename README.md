# 3D Pokémon Ocean Scene

## Overview
This project is an interactive 3D web application built with Three.js that displays a dynamic scene featuring an animated water plane, a realistic sky, and a rotating ring of Pokémon cubes. Each cube fetches random Pokémon data from the [PokéAPI](https://pokeapi.co/) and displays its sprite and details when clicked. The application also supports a **test mode** (enabled via a `?testMode=true` URL parameter) to help stabilize the scene for automated GUI testing with Cypress.


## Features
- **Dynamic 3D Scene:**  
  Renders an ocean-like water surface, a dynamic sky, and a rotating ring of Pokémon cubes using Three.js.
- **API Integration:**  
  Fetches Pokémon data (including sprites and stats) from the PokéAPI.
- **Interactive UI:**  
  Uses OrbitControls for camera navigation and displays Pokémon info in an overlay when cubes are clicked.
- **Test Mode:**  
  A special test mode that slows or nearly freezes animations (via `?testMode=true`) to ensure reliable GUI tests.
- **Automated Testing:**  
  Includes at least three Cypress end-to-end tests verifying scene loading, data integrity, and refresh functionality.
- **Powered by WebGL via Three.js:**  
  Uses hardware-accelerated rendering through WebGL to create a rich, interactive 3D scene with water, sky, and Pokémon cubes.

## Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (v6 or higher)

### Steps
1. **Clone the Repository:**
   ```bash
   git clone <repository-url>

2. **Navigate to the Project Directory:**

```bash

cd Pokemon
```
3. **Install Dependencies:**

```bash
npm install
```
4. **Start the Development Server:**

```bash
npm run dev
```
The application will start (usually at http://localhost:5173).

### Running in Test Mode
To run the app in test mode (which disables certain interactions and slows animations), visit:
```ruby
http://localhost:5173/?testMode=true
```

### Running the Tests
This project uses Cypress for automated GUI testing. To run the tests:

Start the development server:

```bash
npm run dev
```
Open Cypress in another terminal:

```bash
npm run cypress:open
```
In the Cypress Test Runner, select the test file (e.g., cypress/e2e/pokemon_data.cy.js) to run the tests.

### Project Structure
index.html:
The main HTML file setting up the overlay and loading the main JavaScript module.

src/main.js:
Contains all the application logic (scene setup, data fetching, animations, and interactions). Every function is documented with JSDoc comments.

cypress/e2e/pokemon_data.cy.js:
Contains the Cypress end-to-end tests verifying that the scene loads, data is correctly fetched, and the refresh functionality works.

package.json:
Lists the project dependencies and scripts.

### Documentation and Version Control
**JSDoc Comments:**
All functions in src/main.js are fully documented using JSDoc.

**Git Version Control:**
The project is maintained in Git with a meaningful commit history. We also use GitHub Issues and Projects (Kanban/Scrum board) to manage our sprints and tasks.

**Future enhancements may include:**

Additional interactive features (e.g., filtering or detailed Pokémon statistics).

Enhanced UI/UX with polished animations and responsiveness.

More comprehensive testing, including unit and performance tests.
![WebGL](https://img.shields.io/badge/WebGL-Enabled-green?logo=webgl)

