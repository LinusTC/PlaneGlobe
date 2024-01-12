import * as THREE from 'three';
import {updateRotation, globe, globeRadius, group, targetRotation, dataArray} from './main.js';

export function jumpToPing(longitude, latitude){
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

export function addPing(longitude, latitude, color) {
    //Get X,Y,Z Coordinate on globe
    const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);

    //Create a marker
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: color });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);
    globe.add(marker);

    //Jump to marker
    jumpToPing(longitude, latitude);
}

export function removePing(longitude, latitude) {
    const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);
  
    for (let i = 0; i < globe.children.length; i++) {
        const marker = globe.children[i];
        const markerPosition = marker.position;
  
        if (markerPosition.x === x && markerPosition.y === y && markerPosition.z === z) {
          globe.remove(marker);
        }
    }
}

export function findPing(longitude, latitude) {
    const [x, y, z] = lnglatToXYZ(longitude, latitude, globeRadius);
  
    for (let i = 0; i < globe.children.length; i++) {
      const marker = globe.children[i];
      const markerPosition = marker.position;
  
      if (markerPosition.x === x && markerPosition.y === y && markerPosition.z === z) {
        return marker;
      }
    }
    return null;
}

export function removeAllPings() {
    const allMarkers = [];
    for (let i = 0; i < globe.children.length; i++) {
      const marker = globe.children[i];
      allMarkers.push(marker);
    }
    allMarkers.forEach(marker => {
      globe.remove(marker);
    });
}

export function getAirportCoordinates(airportName) {
    const airport = dataArray.find((item) => item.name === airportName);
    return { lng: airport.lon, lat: airport.lat };
  }
  