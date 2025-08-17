import * as THREE from 'three';

export function createTraveller (){
    const travelerGeom = new THREE.SphereGeometry(0.05, 16, 16);
    const travelerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const traveler = new THREE.Mesh(travelerGeom, travelerMat);

    return traveler;
}