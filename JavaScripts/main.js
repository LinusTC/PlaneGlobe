import * as THREE from 'three';
import {handleMouseDown, handleMouseUp, handleMouseMove, handleWheel } from './MouseControl.js';
import {fetchData} from './GetAirportData.js'; 
import {jumpToPing, lnglatToXYZ } from './JumpToPing.js';
import {setUpEnd, setUpStart} from './SearchBar.js';

let dataArray = [];
let airportNames = [];
const url = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';
let selectedStart = null;
let selectedEnd = null;

fetchData(url)
  .then((data) => {
    dataArray = data;
    airportNames = dataArray.map(airport => airport.name);
    setUpStart(airportNames, selectedStart, 0x00ff00);
    setUpEnd(airportNames, selectedEnd, 0xff0000);
  })
  .catch((error) => {
    console.error('Error:', error);
});

//Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Renderer
const renderer = new THREE.WebGLRenderer(
	{antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild( renderer.domElement );

//Globe
const globeRadius = 10;
const geometry = new THREE.SphereGeometry(globeRadius, 100, 100);
const material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('./images/UVmap.jpeg') } );
const globe = new THREE.Mesh( geometry, material);

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
const group = new THREE.Group();
group.add(globe);
scene.add(group);
const rotationSpeed = 0.08;
let targetRotation = { x: 0, y: 0 };

//Mouse Tracker
addEventListener('mousedown', (event) => {handleMouseDown(event, camera, globe);});
addEventListener('mouseup', handleMouseUp);
addEventListener('mousemove', (event) => {handleMouseMove(event, targetRotation);});
addEventListener('wheel', (event) => {handleWheel(event, targetRotation, renderer);}, { passive: false });

//Animate
camera.position.z = 15;
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

export function addPingForSelectedAirport(selectedAirport,color) {
  const airport = dataArray.find((item) => item.name === selectedAirport);
  const lon = airport.lon;
  const lat = airport.lat;

  addPing(lon, lat, color);
  
  return {lon, lat};
}

function addPing(longitude, latitude, color) {
    //Get X,Y,Z Coordinate on globe
    const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);

    //Create a marker
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: color });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);
    globe.add(marker);

    //Jump to marker
    jumpToPing(longitude, latitude, globeRadius, group, targetRotation);
}

export function removePing(longitude, latitude) {
  const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);

  for (let i = 0; i < globe.children.length; i++) {
      const marker = globe.children[i];
      const markerPosition = marker.position;
      if (markerPosition.x === x && markerPosition.y === y && markerPosition.z === z) {
        globe.remove(marker);
      }
  }
}
