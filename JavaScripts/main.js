import * as THREE from 'three';
import {handleMouseDown, handleMouseUp, handleMouseMove, handleWheel } from './MouseControl.js';
import {fetchData} from './GetAirportData.js'; 
import {jumpToPing, lnglatToXYZ, addPing, removeAllPings, findPing, getAirportCoordinates} from './PingFunctions.js';
import {setUpEnd, setUpStart, selectedEndSearch, selectedStartSearch} from './SearchBar.js';
import {getLinePoints, objectFollowLine} from './LinePlane.js';

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
for (let i = 0;i < 20000; i++){
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
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
export let targetRotation = {x: 0, y: 0};

//Mouse Tracker
addEventListener('mousedown', (event) => {handleMouseDown(event, camera);});
addEventListener('mouseup', handleMouseUp);
addEventListener('mousemove', (event) => {handleMouseMove(event, targetRotation);});
addEventListener('wheel', (event) => {handleWheel(event);}, { passive: false });
document.querySelector('.map-button button').addEventListener('click', handleMapButtonClick);
document.querySelector('.erase-button button').addEventListener('click', removeAllPings);

//Animate
camera.position.z = 15.5;
function animate() {
	requestAnimationFrame(animate);
  	updateRotation();
    stars.rotation.x += 0.0003;
    stars.rotation.y += 0.0003;
    renderer.render(scene, camera);
  }
animate();

//Functions
export function updateRotation() {
  globe.rotation.x += (targetRotation.x - globe.rotation.x) * rotationSpeed;
  globe.rotation.y += (targetRotation.y - globe.rotation.y) * rotationSpeed;
}

function handleMapButtonClick() {
  if (selectedStartSearch && selectedEndSearch) {
    addPingForSelectedAirport(selectedStartSearch, 0x00ff00);
    addPingForSelectedAirport(selectedEndSearch, 0x0000ff);
    const lineData = getLinePoints(selectedStartSearch, selectedEndSearch);
    const line = lineData.line;
    const points = lineData.points;
    globe.add(line);
    objectFollowLine(points);
  }
  else{
    console.log('empty')
  }
}

export function addPingForSelectedAirport(selectedAirport,color) {
  const airport = dataArray.find((item) => item.name === selectedAirport);
  const lng = airport.lon;
  const lat = airport.lat;

  const exist = findPing(lng, lat)
  if(exist == null){
    addPing(lng, lat, color)
  }
}