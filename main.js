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
const globeRadius = 10;
const geometry = new THREE.SphereGeometry(globeRadius, 100, 100);
const material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('./images/UVmap.jpg') } );
const globe = new THREE.Mesh( geometry, material);

//Mouse movement setup
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

	addPing(-74.00597, 40.71427, 0x00ff00); // New York

	addPing(13.41053, 52.52437, 0x00ff00); // Berlin

	addPing(114.16, 22.3, 0x00ff00); // Hong Kong

	addPing(-122.41, 37.77, 0x00ff00); // San Fran

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
	  globe.rotation.y += 0.0002;
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

function addPing(longitude, latitude, color) {
    const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);

    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: color });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    marker.position.set(x, y, z);

    globe.add(marker);
}

function lnglatToXYZ(longitude, latitude, radius) {
    const radLat = (90 - latitude) * (Math.PI / 180);
    const radLng = (longitude + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(radLat) * Math.cos(radLng));
    const z = radius * Math.sin(radLat) * Math.sin(radLng);
    const y = radius * Math.cos(radLat);

    return [x, y, z];
}