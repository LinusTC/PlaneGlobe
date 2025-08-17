import * as THREE from 'three';
import { createOrbitControls, CameraController } from './cameraControls.js';
import { getData } from './getAirportData.js';
import { clickMap, setUpAutocomplete } from './searchContainer.js';
import { setUpCamera, setUpRenderer, setUpStars, setUpBackground } from './setup.js';
import { sphere, line, drawLines } from './globe.js';
import { getLinePoints } from './markers&PathsFunctions.js';
import { cameraPositionZ } from './constants.js';

//A global singleton store
export const globalStore = {
  airportData: null,
  airportNames: null,
  depAirport: null,
  arrAirport: null,
  ready: getData().then(({ airportData, airportNames }) => {
    globalStore.airportData = airportData;
    globalStore.airportNames = airportNames;
  }),
  plottedAirports: new Set(),
  plottedLines: new Set(),
};

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
camera.position.z = cameraPositionZ;

const cameraController = new CameraController(setUpCamera);
const controls = createOrbitControls(camera, renderer);

//Seach Containers
globalStore.ready.then(function () {
  setUpAutocomplete(globalStore.airportNames, 'input-box-start', '.result-box-start', (value) => {globalStore.depAirport = value;});
  setUpAutocomplete(globalStore.airportNames, 'input-box-end', '.result-box-end', (value) => {globalStore.arrAirport = value;});
});

//Map and Erase Buttons
const containerLM = new THREE.Object3D();
scene.add(containerLM)
document.querySelector('.map-button button').addEventListener('click', 
  function () {
    globalStore.ready.then(function () {
      const [depMarker, arrMarker] = clickMap(globalStore.depAirport, globalStore.arrAirport, cameraController)

      if(!globalStore.plottedAirports.has(globalStore.depAirport)){
        globalStore.plottedAirports.add(globalStore.depAirport);
        containerLM.add(depMarker);
      }

      if(!globalStore.plottedAirports.has(globalStore.arrAirport)){
        globalStore.plottedAirports.add(globalStore.arrAirport);
        containerLM.add(arrMarker);
      }

      const [line, points] = getLinePoints(globalStore.depAirport, globalStore.arrAirport);
      const lineKey = getLineKey(globalStore.depAirport, globalStore.arrAirport);
      if (!globalStore.plottedLines.has(lineKey)) {
          globalStore.plottedLines.add(lineKey); // store the key
          containerLM.add(line);
      }
    })
  }
);

document.querySelector('.erase-button button').addEventListener('click', 
  function () {
    globalStore.plottedAirports.clear();
    globalStore.plottedLines.clear()
    while (containerLM.children.length > 0) {
      const child = containerLM.children[0];
      containerLM.remove(child);
    }
  }
);

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

//Line name between two airports
function getLineKey(dep, arr) {
  return [dep, arr].sort().join(' to ');
}