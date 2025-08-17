import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getData } from './getAirportData.js';
import { setUpAutocomplete } from './searchBar.js';
import { setUpCamera, setUpRenderer, setUpStars, setUpBackground } from './setup.js';
import { sphere, line, drawLines } from './globe.js';

//Global Storage
export const globalStore = {
  airportData: null,
  airportNames: null,
  startAirport: null,
  endAirport: null,
};

//Seach Containers
(async () => {
  globalStore.airportData, globalStore.airportNames = await getData();
  setUpAutocomplete(globalStore.airportNames, 'input-box-start', '.result-box-start', (value) => {globalStore.startAirport = value;});
  setUpAutocomplete(globalStore.airportNames, 'input-box-end', '.result-box-end', (value) => {globalStore.endAirport = value;});
})();

//Scene
const scene = new THREE.Scene();

//Camera
const camera = setUpCamera;
camera.position.z = 5

//Renderer
const renderer = setUpRenderer
document.body.appendChild( renderer.domElement );

//Stars
scene.add(setUpStars);

//Background
scene.background = setUpBackground

//Globe
scene.add(sphere)
scene.add(line)
scene.add(await drawLines());

//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.02;


//Animate
function animate() {
	requestAnimationFrame(animate);
    setUpStars.rotation.x += 0.0001;
    setUpStars.rotation.y += 0.0001;
    renderer.render(scene, camera);
    controls.update();
  }
animate();