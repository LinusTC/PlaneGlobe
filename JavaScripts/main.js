import * as THREE from 'three';
import {handleMouseDown, handleMouseUp, handleMouseMove, handleWheel } from './MouseControl.js';
import {fetchData} from './GetAirportData.js'; 
import {jumpToPing, lnglatToXYZ } from './JumpToPing.js';

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

//Get Airport Data
let dataArray = [];
let airportNames = [];
const url = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';

fetchData(url)
  .then((data) => {
    dataArray = data;
    airportNames = dataArray.map(airport => airport.name);
    for (let i = 0; i < 5;i++){
        const lng = dataArray[i].lon;
        const lat = dataArray[i].lat;
        console.log(airportNames[i]);
        addPing(lng, lat, 0x00ff00);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
});

//Animate
camera.position.z = 15;
function animate() {
	requestAnimationFrame(animate);
  	updateRotation();
  	renderer.render(scene, camera);
}
animate();

//Functions
export function updateRotation() {
    group.rotation.x += (targetRotation.x - group.rotation.x) * rotationSpeed;
    group.rotation.y += (targetRotation.y - group.rotation.y) * rotationSpeed;
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