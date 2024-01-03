import * as THREE from 'three';
import {handleMouseDown, handleMouseUp, handleMouseMove, handleWheel } from './MouseControl.js';
import {fetchData} from './GetAirportData.js'; 
import {jumpToPing, lnglatToXYZ, addPing, removeAllPings, findPing, getAirportCoordinates} from './PingFunctions.js';
import {setUpEnd, setUpStart, selectedEndSearch, selectedStartSearch} from './SearchBar.js';

export let dataArray = [];
let airportNames = [];
const url = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';
let selectedStart = null;
let selectedEnd = null;

fetchData(url)
  .then((data) => {
    dataArray = data;
    airportNames = dataArray.map(airport => airport.name);
    setUpStart(airportNames, selectedStart);
    setUpEnd(airportNames, selectedEnd);
  })
  .catch((error) => {
    console.error('Error:', error);
});

//Camera
const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Renderer
export const renderer = new THREE.WebGLRenderer(
	{antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild( renderer.domElement );

//Globe
export const globeRadius = 10;
const geometry = new THREE.SphereGeometry(globeRadius, 100, 100);
const material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('./images/UVmap.jpeg') } );
export const globe = new THREE.Mesh( geometry, material);

//Stars
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff});

const starArray = []
for (let i = 0;i < 10000; i++){
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 2000;
  starArray.push(x,y,z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starArray, 3))
const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars);

//Background
scene.background = new THREE.Color(0x111125);

//Mouse movement setup
export const group = new THREE.Group();
group.add(globe);
scene.add(group);
const rotationSpeed = 0.08;
export let targetRotation = { x: 0, y: 0 };

//Mouse Tracker
addEventListener('mousedown', (event) => {handleMouseDown(event, camera);});
addEventListener('mouseup', handleMouseUp);
addEventListener('mousemove', (event) => {handleMouseMove(event, targetRotation);});
addEventListener('wheel', (event) => {handleWheel(event);}, { passive: false });
document.querySelector('.map-button button').addEventListener('click', handleMapButtonClick);
document.querySelector('.erase-button button').addEventListener('click', removeAllPings);

//Animate
camera.position.z = 16;
function animate() {
	requestAnimationFrame(animate);
  	updateRotation();
    stars.rotation.x += 0.0001;
    stars.rotation.y += 0.0001;
    renderer.render(scene, camera);
  }
animate();

//Functions
export function updateRotation() {
  group.rotation.x += (targetRotation.x - group.rotation.x) * rotationSpeed;
  group.rotation.y += (targetRotation.y - group.rotation.y) * rotationSpeed;
}

function handleMapButtonClick() {
  if (selectedStartSearch && selectedEndSearch) {
    addPingForSelectedAirport(selectedStartSearch, 0x00ff00);
    addPingForSelectedAirport(selectedEndSearch, 0x0000ff);
    drawTravelLine(selectedStartSearch, selectedEndSearch);
  } else {
    console.log("Please select both start and end airports.");
  }
}

export function addPingForSelectedAirport(selectedAirport,color) {
  const airport = dataArray.find((item) => item.name === selectedAirport);
  const lon = airport.lon;
  const lat = airport.lat;

  const exist = findPing(lon, lat)
  if(exist == null){
    addPing(lon, lat, color)
  }
}

function drawTravelLine(startAirport, endAirport) {
  const startCoords = getAirportCoordinates(startAirport);
  const endCoords = getAirportCoordinates(endAirport);

  const points = [];
  const numPoints = 100;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lon = startCoords.lon + t * (endCoords.lon - startCoords.lon);
    const lat = startCoords.lat + t * (endCoords.lat - startCoords.lat);

    const radius = globeRadius + Math.sin(t * Math.PI) * 0.5;
    const clampedRadius = Math.min(radius, globeRadius + 1);

    const [x, y, z] = lnglatToXYZ(lon, lat, clampedRadius);
    points.push(new THREE.Vector3(x, y, z));
  }
  //Line
const lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 20});
const lineGeometry = new THREE.BufferGeometry();
const line = new THREE.Line(lineGeometry, lineMaterial);
globe.add(line);
  line.geometry.setFromPoints(points);
}