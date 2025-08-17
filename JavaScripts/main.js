import * as THREE from 'three';
import { createOrbitControls, CameraController } from './cameraControls.js';
import { getData } from './getAirportData.js';
import { clickMap, setUpAutocomplete } from './searchContainer.js';
import { setUpCamera, setUpRenderer, setUpStars, setUpBackground } from './setup.js';
import { sphere, line, drawLines } from './globe.js';

//A global singleton store
export const globalStore = {
  airportData: null,
  airportNames: null,
  startAirport: null,
  endAirport: null,
  ready: getData().then(({ airportData, airportNames }) => {
    globalStore.airportData = airportData;
    globalStore.airportNames = airportNames;
  })
};

//Seach Containers
globalStore.ready.then(function () {
  setUpAutocomplete(globalStore.airportNames, 'input-box-start', '.result-box-start', (value) => {globalStore.startAirport = value;});
  setUpAutocomplete(globalStore.airportNames, 'input-box-end', '.result-box-end', (value) => {globalStore.endAirport = value;});
});

//Map and Erase Buttons
document.querySelector('.map-button button').addEventListener('click', 
  function () {
    globalStore.ready.then(function () {
    let [depMarker, arrMarker] = clickMap(globalStore.startAirport, globalStore.endAirport, cameraController)
      scene.add(depMarker);
      scene.add(arrMarker);
    })
  }
);

//Scene
const scene = new THREE.Scene();

//Renderer
const renderer = setUpRenderer
document.body.appendChild( renderer.domElement );

//Stars
scene.add(setUpStars);

//Background
scene.background = setUpBackground

//Globe
const globeContainer = new THREE.Object3D();
globeContainer.add(sphere);
globeContainer.add(line);
globeContainer.add(await drawLines());

scene.add(globeContainer);

//Camera and Orbit Controls
const camera = setUpCamera;
camera.position.z = 5

const cameraController = new CameraController(setUpCamera);
const controls = createOrbitControls(camera, renderer);

//Animate
function animate() {
	requestAnimationFrame(animate);
    setUpStars.rotation.x += 0.0001;
    setUpStars.rotation.y += 0.0001;
    cameraController.update();
    renderer.render(scene, camera);
    controls.update();
  }
animate();