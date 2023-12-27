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
const material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('./images/UVmap.jpeg') } );
const globe = new THREE.Mesh( geometry, material);

//Mouse movement setup
const group = new THREE.Group();
group.add(globe);
scene.add(group);
const rotationSpeed = 0.08;
let targetRotation = { x: 0, y: 0 };

//Mouse Tracker
let isLeftButtonDown = false;
let previousMousePosition = { x: 0, y: 0 };
let cursorOnGlobe = false;

addEventListener('mousedown', (event) => {
    {if (event.button === 0) {
        isLeftButtonDown = true;
        previousMousePosition = {
            x: event.clientX / window.innerWidth * 2 - 1,
            y: event.clientY / window.innerHeight * 2 + 1
        };

        checkIfClickedOnGlobe(event);
    }}
});
addEventListener('mouseup', (event) => {
	if (event.button === 0) {
		isLeftButtonDown = false;
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
        const scrollSpeed = 0.003;

        const verticalChange = event.deltaY;
        targetRotation.x += -verticalChange * scrollSpeed;
        const horizontalChange = event.deltaX;
        targetRotation.y += -horizontalChange * scrollSpeed;

        if (event.target === renderer.domElement) {
            event.preventDefault();
        }

    }
}, { passive: false });

function addPingsWithDelay() {
    const pingsData = [
        { longitude: -74.00597, latitude: 40.71427, color: 0x00ff00 }, // New York
        { longitude: 13.41053, latitude: 52.52437, color: 0x00ff00 }, // Berlin
        { longitude: 114.16, latitude: 22.3, color: 0x00ff00 }, // Hong Kong
        { longitude: -122.41, latitude: 37.77, color: 0x00ff00 }, // San Fran
    ];

    pingsData.forEach((pingData, index) => {
        setTimeout(() => {
            addPing(pingData.longitude, pingData.latitude, pingData.color);
        }, index * 2000); // Delay in milliseconds (2 seconds in this example)
    });
}

// Call the function to add pings with a delay
addPingsWithDelay();

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
    group.rotation.x += (targetRotation.x - group.rotation.x) * rotationSpeed;
    group.rotation.y += (targetRotation.y - group.rotation.y) * rotationSpeed;
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

    const target = new THREE.Vector3(x, y, z);

    // Calculate rotation angles to face the ping
    const angles = calculateRotationAngles(group.position, target);
    targetRotation.x = angles.x;
    targetRotation.y = angles.y;

    // Update rotation immediately to face the ping
    group.rotation.set(targetRotation.x, targetRotation.y, 0);

    globe.add(marker);
}

function calculateRotationAngles(currentPosition, targetPosition) {
    const direction = new THREE.Vector3().subVectors(targetPosition, currentPosition);
    const spherical = new THREE.Spherical().setFromVector3(direction);

    return {
        x: Math.PI / 2 - spherical.phi,
        y: -spherical.theta,
    };
}

function lnglatToXYZ(longitude, latitude, radius) {
    const radLat = (90 - latitude) * (Math.PI / 180);
    const radLng = (longitude + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(radLat) * Math.cos(radLng));
    const z = radius * Math.sin(radLat) * Math.sin(radLng);
    const y = radius * Math.cos(radLat);

    return [x, y, z];
}