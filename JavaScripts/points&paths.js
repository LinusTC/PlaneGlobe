import * as THREE from "three";
import { globeRadius } from "./constants.js";

export function getXYZCoordinate(lon, lat) {
    const lonRad = THREE.MathUtils.degToRad(lon);
    const latRad = THREE.MathUtils.degToRad(lat);

    const x = globeRadius * Math.cos(latRad) * Math.sin(lonRad);
    const y = globeRadius * Math.sin(latRad);      // vertical axis
    const z = globeRadius * Math.cos(latRad) * Math.cos(lonRad);

    return [x, y, z];
}

export function createMarker(lon, lat, radius = 0.03, color = 0x00ff00) {
    const [x, y, z] = getXYZCoordinate(lon, lat);

    // Create a flat circle
    const geometry = new THREE.CircleGeometry(radius,16,8);
    const material = new THREE.MeshBasicMaterial({ color });
    const circle = new THREE.Mesh(geometry, material);

    circle.position.set(x, y, z);

    // Make it face outward from the globe
    circle.lookAt(0, 0, 0);
    circle.rotateX(Math.PI); // flip so it’s facing outwards

    return circle;
}
