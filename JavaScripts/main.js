import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setUpCamera, setUpRenderer, setUpStars, setUpBackground } from './setup.js';
import { sphere, line, drawLines } from './globe.js';

//Scene
const scene = new THREE.Scene();

//Camera
const camera = setUpCamera;
camera.position.z = 5

//Renderer
const renderer = setUpRenderer
document.body.appendChild( renderer.domElement );

//Stars
scene.add(setUpStars);

//Background
scene.background = setUpBackground

//Globe
scene.add(sphere)
scene.add(line)
const countries = await drawLines();
scene.add(countries);

//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.02;


//Animate
function animate() {
	requestAnimationFrame(animate);
    setUpStars.rotation.x += 0.0001;
    setUpStars.rotation.y += 0.0001;
    renderer.render(scene, camera);
    controls.update();
  }
animate();