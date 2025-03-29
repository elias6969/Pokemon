/**
 * @file main.js
 * @description 3D Pokémon Ocean Scene with Water, Sky, and a Rotating Ring of Pokémon Cubes.
 *              Supports test mode (via URL query parameter ?testMode=true) for reliable GUI tests.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

////////////////////////////////////////////////////////////////
//  POKEAPI CONFIGURATION
////////////////////////////////////////////////////////////////

const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
const NUM_CUBES = 10;      // Number of Pokémon cubes in the ring
const RING_RADIUS = 10;    // Radius of the ring
let cubes = [];            // Array to store objects of the form { mesh, pokemonData }

////////////////////////////////////////////////////////////////
//  GLOBAL THREE.JS VARIABLES
////////////////////////////////////////////////////////////////

let scene, camera, renderer, controls;
let water;               // Water plane object
let sky, sun;            // Sky object and sun vector
let ringGroup;           // Group that holds the rotating Pokémon cubes
let pmremGenerator;      // Environment map generator
let pokemonInfoDiv;      // DOM element for displaying Pokémon info

////////////////////////////////////////////////////////////////
//  SCENE INITIALIZATION
////////////////////////////////////////////////////////////////

/**
 * Initializes the Three.js scene, including camera, renderer, lights, sky, water, and controls.
 * Also sets up test mode behavior.
 * @returns {void}
 */
function initScene() {
  // Create the scene.
  scene = new THREE.Scene();

  // Set up the camera.
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 10, 25);

  // Create the renderer.
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Check for test mode via URL parameters.
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('testMode') === 'true';

  // If in test mode, disable pointer capture to avoid errors.
  if (testMode) {
    renderer.domElement.setPointerCapture = () => {};
  }

  // Set up OrbitControls.
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add ambient and directional lights.
  const ambientLight = new THREE.AmbientLight(0x00bdff, 0.1);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 50, 0);
  scene.add(dirLight);

  // Set up the sky.
  sky = new Sky();
  sky.scale.setScalar(1000);
  scene.add(sky);
  sun = new THREE.Vector3();

  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 1;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 1.0;

  const phi = THREE.MathUtils.degToRad(90 - 20); // 20° above horizon.
  const theta = THREE.MathUtils.degToRad(180);
  sun.setFromSphericalCoords(1, phi, theta);
  skyUniforms['sunPosition'].value.copy(sun);

  // Generate an environment map from the sky.
  pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const skyTex = pmremGenerator.fromScene(sky).texture;
  scene.environment = skyTex;

  // Set up the water plane.
  const waterGeometry = new THREE.PlaneGeometry(200, 200);
  water = new Water(waterGeometry, {
    color: 0x0088aa,
    scale: 3,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
    distortionScale: 4.0,
    alpha: 1.0,
    normalMap0: new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg'
    ),
    normalMap1: new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg'
    ),
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // Create a group for the rotating Pokémon cubes.
  ringGroup = new THREE.Group();
  scene.add(ringGroup);

  // Listen for window resize events.
  window.addEventListener('resize', onWindowResize);
}

////////////////////////////////////////////////////////////////
//  WINDOW RESIZE HANDLER
////////////////////////////////////////////////////////////////

/**
 * Handles window resize events by updating the camera aspect ratio and renderer size.
 * @returns {void}
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

////////////////////////////////////////////////////////////////
//  ANIMATION LOOP
////////////////////////////////////////////////////////////////

/**
 * The animation loop. Rotates the Pokémon ring (unless in test mode), updates water animation,
 * and renders the scene.
 * @returns {void}
 */
function animate() {
  requestAnimationFrame(animate);

  // Check for test mode.
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('testMode') === 'true';

  // Rotate the ring; in test mode, rotate very slowly.
  if (!testMode) {
    ringGroup.rotation.y += 0.003;
  } else {
    ringGroup.rotation.y += 0.0001;
  }

  // Update water animation.
  water.material.uniforms['time'].value += 1.0 / 60.0;

  controls.update();
  renderer.render(scene, camera);
}

////////////////////////////////////////////////////////////////
//  FETCHING POKÉMON DATA
////////////////////////////////////////////////////////////////

/**
 * Fetches a random Pokémon from the PokeAPI.
 * @returns {Promise<Object>} A promise that resolves with the Pokémon JSON data.
 */
async function fetchRandomPokemon() {
  const randomId = Math.floor(Math.random() * 1010) + 1;
  const resp = await fetch(`${POKE_API_BASE}${randomId}`);
  if (!resp.ok) throw new Error('Failed to fetch Pokémon data');
  return resp.json();
}

////////////////////////////////////////////////////////////////
//  POKÉMON CUBE CREATION
////////////////////////////////////////////////////////////////

/**
 * Creates a cube mesh for displaying a Pokémon sprite.
 * @returns {THREE.Mesh} The created cube mesh.
 */
function createCube() {
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

/**
 * Sets the texture of a cube's material to a Pokémon sprite from a URL.
 * @param {THREE.Mesh} mesh - The cube mesh.
 * @param {string} spriteURL - The URL of the Pokémon sprite.
 * @returns {void}
 */
function setCubeTexture(mesh, spriteURL) {
  const loader = new THREE.TextureLoader();
  loader.load(spriteURL, (texture) => {
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
  });
}

/**
 * Creates or refreshes the ring of Pokémon cubes by fetching random Pokémon data.
 * Exposes the current Pokémon IDs in a global variable (window.lastPokemonIDs) for testing.
 * @returns {Promise<void>} A promise that resolves when the ring is updated.
 */
async function createPokemonRing() {
  // Remove existing cubes.
  cubes.forEach(({ mesh }) => ringGroup.remove(mesh));
  cubes = [];

  for (let i = 0; i < NUM_CUBES; i++) {
    const mesh = createCube();
    const angle = (i / NUM_CUBES) * Math.PI * 2;
    mesh.position.set(
      Math.cos(angle) * RING_RADIUS,
      2.0, // Slightly above the water.
      Math.sin(angle) * RING_RADIUS
    );
    // Orient the cube to face the center of the ring.
    mesh.lookAt(0, 2.0, 0);
    ringGroup.add(mesh);

    try {
      const data = await fetchRandomPokemon();
      const sprite = data.sprites.front_default;
      if (sprite) {
        setCubeTexture(mesh, sprite);
        cubes.push({ mesh, pokemonData: data });
      } else {
        cubes.push({ mesh, pokemonData: null });
      }
    } catch (err) {
      console.error('Error fetching Pokémon:', err);
      cubes.push({ mesh, pokemonData: null });
    }
  }

  // Expose the current Pokémon IDs for testing.
  window.lastPokemonIDs = cubes.map(c => c.pokemonData ? c.pokemonData.id : null);
  console.log('Pokémon IDs:', window.lastPokemonIDs);
}

////////////////////////////////////////////////////////////////
//  CLICK PICKING & INFO DISPLAY
////////////////////////////////////////////////////////////////

/**
 * Initializes click picking on the canvas so that when a cube is clicked,
 * its corresponding Pokémon data is displayed in the overlay.
 * @returns {void}
 */
function initClickPicking() {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(ringGroup.children);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const found = cubes.find((c) => c.mesh === clickedMesh);
      if (found && found.pokemonData) {
        showPokemonInfo(found.pokemonData);
      } else {
        pokemonInfoDiv.innerHTML = '<div>No data available.</div>';
      }
    }
  });
}

////////////////////////////////////////////////////////////////
//  INFO DISPLAY
////////////////////////////////////////////////////////////////

/**
 * Displays the given Pokémon information in the overlay element.
 * @param {Object} data - The Pokémon data from the API.
 * @returns {void}
 */
function showPokemonInfo(data) {
  const name = capitalize(data.name);
  const pokeId = data.id;
  const types = data.types.map((t) => capitalize(t.type.name)).join(', ');
  const hp = data.stats[0].base_stat;
  const attack = data.stats[1].base_stat;
  const defense = data.stats[2].base_stat;

  pokemonInfoDiv.innerHTML = `
    <div class="highlight">
      <strong>#${pokeId} ${name}</strong><br />
      <em>Types:</em> ${types}<br />
      <em>HP:</em> ${hp} | <em>Attack:</em> ${attack} | <em>Defense:</em> ${defense}
    </div>
  `;
}

/**
 * Capitalizes the first letter of the given string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

////////////////////////////////////////////////////////////////
//  MAIN EXECUTION
////////////////////////////////////////////////////////////////

/**
 * Main function (IIFE) to initialize and run the application.
 * @returns {Promise<void>}
 */
(async function main() {
  // Get a reference to the overlay element for Pokémon info.
  pokemonInfoDiv = document.getElementById('pokemonInfo');

  // Initialize the scene and set up click picking.
  initScene();
  initClickPicking();

  // Create the ring of Pokémon cubes.
  await createPokemonRing();

  // Start the animation loop.
  animate();

  // Set up the Refresh All button to reload the Pokémon ring.
  document.getElementById('refreshAllBtn').addEventListener('click', async () => {
    pokemonInfoDiv.innerHTML = 'Refreshing...';
    await createPokemonRing();
    pokemonInfoDiv.innerHTML = 'Click on a Pokémon cube to see its info.';
  });
})();
