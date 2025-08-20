import * as THREE from 'three';
import { createOrbitControls, CameraController } from './cameraControls.js';
import { getData } from './getAirportData.js';
import { clickMap, setUpAutocomplete } from './searchContainer.js';
import { setUpCamera, setUpRenderer, setUpStars, setUpBackground } from './setup.js';
import { sphere, line, drawLines } from './globe.js';
import { getLinePoints } from './markers&PathsFunctions.js';
import { cameraPositionZ, flightSpeed } from './constants.js';
import { createTraveller } from './planeObject.js';

//Global store
export const globalStore = {
  airportData: null,
  airportNames: null,
  depAirport: "London Heathrow Airport",
  arrAirport: "Hong Kong International Airport",
  ready: getData().then(({ airportData, airportNames }) => {
    globalStore.airportData = airportData;
    globalStore.airportNames = airportNames;
  }),
  plottedAirports: new Set(),
  plottedLines: new Set(),
  travelers: new Set()
};

//Scene
const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

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

controls.addEventListener('start', () => {cameraController.isMoving = false; });

//Seach Containers
globalStore.ready.then(function () {
  setUpAutocomplete(globalStore.airportNames, 'input-box-start', '.result-box-start', (value) => {globalStore.depAirport = value;});
  setUpAutocomplete(globalStore.airportNames, 'input-box-end', '.result-box-end', (value) => {globalStore.arrAirport = value;});
});

//Map and Erase Buttons
const containerLMT = new THREE.Object3D();
scene.add(containerLMT)
document.querySelector('.map-button button').addEventListener('click', 
  function () {
    globalStore.ready.then(function () {
      const [depMarker, arrMarker] = clickMap(globalStore.depAirport, globalStore.arrAirport, cameraController)

      if(!globalStore.plottedAirports.has(globalStore.depAirport)){
        globalStore.plottedAirports.add(globalStore.depAirport);
        containerLMT.add(depMarker);
      }

      if(!globalStore.plottedAirports.has(globalStore.arrAirport)){
        globalStore.plottedAirports.add(globalStore.arrAirport);
        containerLMT.add(arrMarker);
      }

      const [line, _, path] = getLinePoints(globalStore.depAirport, globalStore.arrAirport);
      const lineKey = getLineKey(globalStore.depAirport, globalStore.arrAirport);
      if (!globalStore.plottedLines.has(lineKey)) {
        globalStore.plottedLines.add(lineKey);
        containerLMT.add(line);

        // traveler sphere
        const traveler = createTraveller();        
        globalStore.travelers.add({
          mesh: traveler,
          path: path,
          length: path.getLength(),
          traveled: 0
        });
        containerLMT.add(traveler);
      }
    })
  }
);

document.querySelector('.erase-button button').addEventListener('click', 
  function () {
    globalStore.plottedAirports.clear();
    globalStore.plottedLines.clear();
    globalStore.travelers.clear();
    while (containerLMT.children.length > 0) {
      const child = containerLMT.children[0];
      containerLMT.remove(child);
    }
  }
);

//Animate
const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);
    const delta = clock.getDelta(); 
    globalStore.travelers.forEach((travelerObj) => {
      travellerAnimation(travelerObj, delta);
    });
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

//Traveller Animation
function travellerAnimation(object, delta) {
  object.traveled += flightSpeed * delta; 
  let t = object.traveled / object.length;
  if (t > 1) {
    object.traveled = 0;
    t = 0;
  }

  const pos = object.path.getPointAt(t);
  const tangent = object.path.getTangentAt(t).normalize();
  const toCenter = new THREE.Vector3(0,0,0).sub(pos).normalize();

  const right = new THREE.Vector3().crossVectors(toCenter, tangent).normalize();
  const up    = new THREE.Vector3().crossVectors(tangent, right).normalize();

  const m = new THREE.Matrix4();
  m.makeBasis(right, up, tangent);

  object.mesh.setRotationFromMatrix(m);
  object.mesh.rotateY(-Math.PI/2)
  object.mesh.rotateX(Math.PI/2)
  object.mesh.position.copy(pos);
}