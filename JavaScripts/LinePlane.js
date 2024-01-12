import * as THREE from 'three';
import {globe, globeRadius} from './main.js';
import { getAirportCoordinates, lnglatToXYZ } from './PingFunctions.js';

export function getLinePoints(startAirport, endAirport) {
    let numPoints = 1000;
    const start = getAirportCoordinates(startAirport);
    const end = getAirportCoordinates(endAirport);

    const lngDelta = end.lng - start.lng;
    const latDelta = end.lat - start.lat

    const distance = Math.sqrt(lngDelta*lngDelta + latDelta*latDelta);
    numPoints = Math.max(Math.floor((distance/360)*numPoints), 180);

    console.log(numPoints);

    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lng = start.lng + t * (lngDelta);
      const lat = start.lat + t * (latDelta);
  
      const radius = globeRadius + Math.sin(t * Math.PI) * 0.5;
      const maxRadius = Math.min(radius, globeRadius + 1);
  
      const [x, y, z] = lnglatToXYZ(lng, lat, maxRadius);
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