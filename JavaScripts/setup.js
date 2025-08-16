import * as THREE from 'three';

//Camera
export const setUpCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight);

//Renderer
export const setUpRenderer = new THREE.WebGLRenderer();
setUpRenderer.setSize( window.innerWidth, window.innerHeight );

//Background
export const setUpBackground = new THREE.Color(0x111118);

//Stars
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, fog: false});

const starArray = []
for (let i = 0;i < 6000; i++){
  const x = (Math.random() - 0.5) * 1500;
  const y = (Math.random() - 0.5) * 1500;
  const z = (Math.random() - 0.5) * 1500;
  starArray.push(x,y,z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starArray, 3))
export const setUpStars = new THREE.Points(starGeometry, starMaterial)