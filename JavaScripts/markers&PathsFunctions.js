import * as THREE from "three";
import { globeRadius, flightSpeed } from "./constants.js";
import { globalStore } from "./main.js";

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

export function getLinePoints(depAirport, arrAirport) {
    const numPoints = 180;

    const depAirportCoords = globalStore.airportData.get(depAirport);
    const [depLon, depLat] = depAirportCoords;

    const arrAirportCoords = globalStore.airportData.get(arrAirport);
    const [arrLon, arrLat] = arrAirportCoords;

    // Convert lon/lat to unit vectors (ignore globeRadius here)
    const startVec = lonLatToUnitVector(depLon, depLat);
    const endVec = lonLatToUnitVector(arrLon, arrLat);

    const points = [];

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const interpolatedVec = slerp(startVec, endVec, t);
        const radius = globeRadius + Math.sin(t * Math.PI) * 0.35;
        const [x, y, z] = interpolatedVec.map(v => v * radius);
        points.push(new THREE.Vector3(x, y, z));
    }

    const path = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(path, 64, 0.01, 8, false);
    const colors = [];
    const colorStart = new THREE.Color(0xFF8B00);
    const colorEnd = new THREE.Color(0x0200C6);
    for (let i = 0; i < geometry.attributes.position.count; i++) {
        const t = i / (geometry.attributes.position.count - 1);
        let color = new THREE.Color();
        color = colorStart.clone().lerp(colorEnd, t);
        colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });
    const line = new THREE.Mesh(geometry, material);

    return [line, points, path];
}

// Convert lon/lat to unit vector
function lonLatToUnitVector(lon, lat) {
    const lonRad = THREE.MathUtils.degToRad(lon);
    const latRad = THREE.MathUtils.degToRad(lat);

    const x = Math.cos(latRad) * Math.sin(lonRad);
    const y = Math.sin(latRad);
    const z = Math.cos(latRad) * Math.cos(lonRad);

    return [x, y, z];
}

// Spherical linear interpolation between two unit vectors
function slerp(v0, v1, t) {
    let dot = v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2];
    dot = Math.min(Math.max(dot, -1), 1); // clamp
    const theta = Math.acos(dot) * t;

    const relativeVec = v1.map((v,i) => v - v0[i]*dot);
    const relNorm = Math.sqrt(relativeVec.reduce((sum,v)=>sum+v*v,0));
    const scaledRel = relativeVec.map(v => v / relNorm * Math.sin(theta));

    return v0.map((v,i) => v * Math.cos(theta) + scaledRel[i]);
}
