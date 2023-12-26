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
const group = new THREE.Group();
group.add(globe);
scene.add(group);
const rotationSpeed = 0.08;
let autoRotate = true;
let targetRotation = { x: 0, y: 0 };

//Mouse Tracker
let isLeftButtonDown = false;
let previousMousePosition = { x: 0, y: 0 };
let cursorOnGlobe = false;

addEventListener('mousedown', (event) => {
    {if (event.button === 0) {
        isLeftButtonDown = true;
		autoRotate = false;

        previousMousePosition = {
            x: event.clientX / window.innerWidth * 2 - 1,
            y: event.clientY / window.innerHeight * 2 + 1
        };

        checkIfClickedOnGlobe(event);
		if (!cursorOnGlobe) {
            autoRotate = true;
        }
    }}
});
addEventListener('mouseup', (event) => {
	if (event.button === 0) {
		isLeftButtonDown = false;
		autoRotate = true;
	}
});
addEventListener('mousemove', (event) => {
	if (isLeftButtonDown && cursorOnGlobe) {
	  const currentMousePosition = {
		x: event.clientX / window.innerWidth * 2 - 1,
		y: (event.clientY / window.innerHeight) * 2 + 1
	  };
  
	  targetRotation.y += currentMousePosition.x - previousMousePosition.x;
	  targetRotation.x += currentMousePosition.y - previousMousePosition.y;
  
	  previousMousePosition = currentMousePosition;
	}
});

addEventListener('wheel', (event) => {
    if (cursorOnGlobe) {
        autoRotate = false;
        const scrollSpeed = 0.003;

        const verticalChange = event.deltaY;
        targetRotation.x += -verticalChange * scrollSpeed;
        const horizontalChange = event.deltaX;
        targetRotation.y += -horizontalChange * scrollSpeed;

        if (event.target === renderer.domElement) {
            event.preventDefault();
        }

		setTimeout(() => {
            autoRotate = true;
        }, 1);
    }
}, { passive: false });
  
//Animate
camera.position.z = 15;
function animate() {
	requestAnimationFrame(animate);
  	updateRotation();
  	renderer.render(scene, camera);
}
animate();

//Functions
function updateRotation() {
	if (autoRotate) {
	  globe.rotation.y += 0.001;
	} 
	else {
	  group.rotation.x += (targetRotation.x - group.rotation.x) * rotationSpeed;
	  group.rotation.y += (targetRotation.y - group.rotation.y) * rotationSpeed;
	}
}

function checkIfClickedOnGlobe(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(globe);

    if (intersects.length > 0) {
        cursorOnGlobe = true;
    } 
	else {
        cursorOnGlobe = false;
    }
}