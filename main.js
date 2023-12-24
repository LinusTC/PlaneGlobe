import * as THREE from 'three';

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
const geometry = new THREE.SphereGeometry( 10, 100, 100 );
const material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('./images/UVmap.jpg') } );
const globe = new THREE.Mesh( geometry, material );

//Mouse movement
scene.add(globe);
const rotationSpeed = 0.05;

function updateRotation() {
	globe.rotation.x += (targetRotation.x - globe.rotation.x) * rotationSpeed;
	globe.rotation.y += (targetRotation.y - globe.rotation.y) * rotationSpeed;
}

//Mouse Tracker
let isLeftButtonDown = false;
let targetRotation = { x: 0, y: 0 };
let previousMousePosition = { x: 0, y: 0 };

addEventListener('mousedown', (event) => {
	if (event.button === 0) {
	  isLeftButtonDown = true;
  
	  previousMousePosition = {
		x: event.clientX / window.innerWidth * 2 - 1,
		y: (event.clientY / window.innerHeight) * 2 + 1
	  };
	}
});
addEventListener('mouseup', (event) => {
	if (event.button === 0) {
		isLeftButtonDown = false;
	}
});
addEventListener('mousemove', (event) => {
	if (isLeftButtonDown) {
	  const currentMousePosition = {
		x: event.clientX / window.innerWidth * 2 - 1,
		y: (event.clientY / window.innerHeight) * 2 + 1
	  };
  
	  targetRotation.y += currentMousePosition.x - previousMousePosition.x;
	  targetRotation.x += currentMousePosition.y - previousMousePosition.y;
  
	  previousMousePosition = currentMousePosition;
	}
});
  
//Animate
camera.position.z = 15;
function animate() {
	requestAnimationFrame(animate);
  	updateRotation();
  	renderer.render(scene, camera);
}
animate();