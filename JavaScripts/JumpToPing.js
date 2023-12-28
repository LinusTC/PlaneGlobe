import * as THREE from 'three';
import { updateRotation } from './main.js';

export function jumpToPing(longitude, latitude, globeRadius, group, targetRotation){
    const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);

    const target = new THREE.Vector3(x, y, z);
    const angles = calculateRotationAngles(group.position, target);
    targetRotation.x = angles.x;
    targetRotation.y = angles.y;
    updateRotation();
}

export function calculateRotationAngles(currentPosition, targetPosition) {
    const direction = new THREE.Vector3().subVectors(targetPosition, currentPosition);
    const spherical = new THREE.Spherical().setFromVector3(direction);

    return {
        x: Math.PI / 2 - spherical.phi,
        y: -spherical.theta,
    };
}

//Calculate xyz globe coordinate from lnglat
export function lnglatToXYZ(longitude, latitude, radius) {
    const radLat = (90 - latitude) * (Math.PI / 180);
    const radLng = (longitude + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(radLat) * Math.cos(radLng));
    const z = radius * Math.sin(radLat) * Math.sin(radLng);
    const y = radius * Math.cos(radLat);

    return [x, y, z];
}