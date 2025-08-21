import * as THREE from 'three';
import { createOrbitControls, CameraController } from './cameraControls.js';
import { getAirportData, getRouteData } from './getAirportData.js';
import { clearSearchBar, clickMap, setUpAutocomplete } from './searchContainer.js';
import { setUpCamera, setUpRenderer, setUpStars, setUpBackground } from './setup.js';
import { sphere, line, drawLines } from './globe.js';
import { getLinePoints } from './markers&PathsFunctions.js';
import { cameraPositionZ, flightSpeed } from './constants.js';
import { createTraveller } from './planeObject.js';

//Global store
export const globalStore = {
  airportData: null,
  airportCodes: null,
  airports: new Map([[-1, "HKG"]]),
  uniqueRoutes: null,
  plottedAirports: new Set(),
  plottedLines: new Map(),
  travelers: new Set(),

  ready: Promise.all([getAirportData(), getRouteData()])
    .then(function([airportResult, routeResult]) {
      const { airportData, airportCodes } = airportResult;
      globalStore.airportData = airportData;
      globalStore.airportCodes = airportCodes;
      globalStore.uniqueRoutes = routeResult;
    })
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

const cameraController = new CameraController(camera);
const controls = createOrbitControls(camera, renderer);

controls.addEventListener('start', function () {cameraController.isMoving = false; });

//Seach Containers
globalStore.ready.then(function () {
  setUpAutocomplete(globalStore.airportCodes, 'input-box-start', '.result-box-start', function (value) {globalStore.airports.set(-1, value);});
  setUpAutocomplete(globalStore.airportCodes, 'input-box-end', '.result-box-end', function (value) {globalStore.airports.set(0, value);});
});

//Map and Erase Buttons
const containerLMT = new THREE.Object3D();
scene.add(containerLMT)
document.querySelector('.map-button button').addEventListener('click', 
  function () {
    globalStore.ready.then(function () {
      const toVisitAirports = globalStore.airports;
      const markerPairs = clickMap(toVisitAirports, cameraController)

      for (const [depPair, arrPair] of markerPairs) {
        const [[currDepAirport, depMarker]] = Object.entries(depPair);
        const [[currArrAirport, currArrMesh]] = Object.entries(arrPair);

        if(!globalStore.plottedAirports.has(currDepAirport)){
          globalStore.plottedAirports.add(currDepAirport);
          containerLMT.add(depMarker);
        }

        if(!globalStore.plottedAirports.has(currArrAirport)){
          globalStore.plottedAirports.add(currArrAirport);
          containerLMT.add(currArrMesh);
        }
        const [line, _, path] = getLinePoints(currDepAirport, currArrAirport);
        const lineKey = getLineKey(currDepAirport, currArrAirport);
        if (!globalStore.plottedLines.has(lineKey)) {
          globalStore.plottedLines.set(lineKey,{
            mesh: line,
            totalPoints: line.geometry.attributes.position.count,
            elapsed: 0,
            duration: 2
          });
          line.geometry.setDrawRange(0,0);
          containerLMT.add(line);

          // traveler
          if(globalStore.airports.size > 1){
            const traveler = createTraveller();        
            globalStore.travelers.add({
              mesh: traveler,
              path: path,
              length: path.getLength(),
              traveled: 0
            });
            containerLMT.add(traveler);
          }
        }
      }
    })
  }
);

document.querySelector('.erase-button button').addEventListener('click', 
  function () {
    globalStore.plottedAirports.clear();
    globalStore.plottedLines.clear();
    globalStore.travelers.clear();
    globalStore.airports.clear();
    clearSearchBar('input-box-start');
    clearSearchBar('input-box-end');
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
    if (!cameraController.isMoving){
      globalStore.travelers.forEach(function (travelerObj) {
        travellerAnimation(travelerObj, delta);
      });
    }

    globalStore.plottedLines.forEach(function(tempLine){
      if (tempLine.elapsed < tempLine.duration) {
          tempLine.elapsed += delta;
          const progress = Math.min(tempLine.elapsed / tempLine.duration, 1);
          const count = Math.floor(tempLine.totalPoints * progress);
          tempLine.mesh.geometry.setDrawRange(0, count);
          tempLine.mesh.geometry.attributes.position.needsUpdate = true;
      }
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