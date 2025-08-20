import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';
import { getXYZCoordinate } from './markers&PathsFunctions.js';
import { cameraPositionZ } from './constants.js';

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.targetPos = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.isMoving = false;
  }

  moveToAirport(depLon, depLat, distance = cameraPositionZ) {
    const [x, y, z] = getXYZCoordinate(depLon, depLat);
    const dir = new THREE.Vector3(x, y, z).normalize();

    this.targetPos.set(dir.x * distance, dir.y * distance, dir.z * distance);
    this.targetLookAt.set(0, 0, 0);
    this.isMoving = true;
  }

  update() {
    if (!this.isMoving) return;
    // Smoothly move camera position
    this.camera.position.lerp(this.targetPos, 0.03);

    // Smoothly adjust lookAt
    const currentLookAt = new THREE.Vector3();
    this.camera.getWorldDirection(currentLookAt).add(this.camera.position);
    currentLookAt.lerp(this.targetLookAt, 0.03);
    this.camera.lookAt(currentLookAt);

    // Stop moving if close enough
    if (this.camera.position.distanceTo(this.targetPos) < 0.01) {
      this.camera.position.copy(this.targetPos);
      this.camera.lookAt(this.targetLookAt);
      this.isMoving = false;
    }
  }
}

export function createOrbitControls (camera, renderer){
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.02;

    return controls;
}