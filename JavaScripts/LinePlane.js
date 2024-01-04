import * as THREE from 'three';
import {globe, globeRadius} from './main.js';
import { getAirportCoordinates, lnglatToXYZ } from './PingFunctions.js';

const numPoints = 100;

export function getLinePoints(startAirport, endAirport) {
    const startCoords = getAirportCoordinates(startAirport);
    const endCoords = getAirportCoordinates(endAirport);
  
    const points = [];
  
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lon = startCoords.lon + t * (endCoords.lon - startCoords.lon);
      const lat = startCoords.lat + t * (endCoords.lat - startCoords.lat);
  
      const radius = globeRadius + Math.sin(t * Math.PI) * 0.5;
      const clampedRadius = Math.min(radius, globeRadius + 1);
  
      const [x, y, z] = lnglatToXYZ(lon, lat, clampedRadius);
      points.push(new THREE.Vector3(x, y, z));
    }
    //Line
    const lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 20});
    const lineGeometry = new THREE.BufferGeometry();
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.geometry.setFromPoints(points);

    return {line: line, points: points};
}

export function objectFollowLine (points){
  const ballGeometry = new THREE.SphereGeometry(0.05, 32, 32);
  const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const object = new THREE.Mesh(ballGeometry, ballMaterial);
  globe.add(object);

  let pointIndex = 0;
    function animate() {
      if (pointIndex < points.length) {
        const { x, y, z } = points[pointIndex];
        object.position.set(x, y, z);
        pointIndex++;
        requestAnimationFrame(animate);
      }
      else{
        pointIndex = 0;
        points.reverse();
        requestAnimationFrame(animate);
      }
  }
  animate();
}