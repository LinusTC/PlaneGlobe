import * as THREE from 'three';
import { drawThreeGeo } from "./threeGeoJSON.js";

const geometry = new THREE.SphereGeometry(2);
const lineMat = new THREE.LineBasicMaterial({ 
  color: 0xffffff,
  transparent: true,
  opacity: 0.15, 
});

const edges = new THREE.EdgesGeometry(geometry, 1);
export const line = new THREE.LineSegments(edges, lineMat);

const material = new THREE.MeshBasicMaterial( { color: 0x080c10 } ); 
export const sphere = new THREE.Mesh( geometry, material );

export async function drawLines() {
  const response = await fetch('./data/countries.json');
  const data = await response.json();
  const countries = drawThreeGeo({
    json: data,
    radius: 2,
  });
  return countries;
}