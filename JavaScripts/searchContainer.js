import { globalStore } from "./main.js";
import { createMarker, getXYZCoordinate } from "./markers&PathsFunctions.js";
import * as THREE from 'three';
import { CameraController } from "./cameraControls.js";

export function setUpAutocomplete(airportCodes, inputId, resultsBoxSelector, onSelect) {
  const resultsBox = document.querySelector(resultsBoxSelector);
  const inputBox = document.getElementById(inputId);
  const airports = Array.from(airportCodes.entries()).map(([code, name]) => ({ code, name }));

  inputBox.onkeyup = function () {
    const input = inputBox.value.trim().toLowerCase();
    const results = input.length
      ? airports.filter(function(a) {return a.name.toLowerCase().includes(input)})
      : [];

    displayResult(results);
    if (!results.length) resultsBox.innerHTML = '';
  };

  function displayResult(result) {
    resultsBox.innerHTML = `<ul>${result
      .map(a => `<li>${a.name}</li>`)
      .join('')}</ul>`;

    resultsBox.querySelectorAll('li').forEach(function(item, index) {
      item.addEventListener('click', function() {
        const selected = result[index];
        inputBox.value = selected.name;   // show airport name
        resultsBox.innerHTML = '';
        if (onSelect) onSelect(selected.code); // return airport code
      });
    });
  }
}


export function clickMap(depAirport, arrAirport, CameraController){
  if (!depAirport && !arrAirport)return;

  if (!arrAirport){
    let airportArray = []
    const [depLon, depLat] = globalStore.airportData.get(depAirport)[1];
    const dep = createMarker(depLon, depLat);
    CameraController.moveToAirport(depLon, depLat);

    let arrAirports = []
    for (const route of globalStore.uniqueRoutes){
      if (route[0] === depAirport || route[1] === depAirport){
        const arrCode = (route[0] === depAirport) ? route[1] : route[0];
        arrAirports.push(arrCode); 
      }
    }
    
    for (const airport of arrAirports){
      console.log(airport)
      if (!globalStore.airportCodes.has(airport))continue;
      const [arrLon, arrLat] = globalStore.airportData.get(airport)[1];
      const arr = createMarker(arrLon, arrLat);
      const depPair = {[depAirport]: dep};
      const arrPair = {[airport]: arr};
      airportArray.push([depPair, arrPair])
    }
    return airportArray;
  }

  const depAirportCoords = globalStore.airportData.get(depAirport)[1];
  const [depLon, depLat] = depAirportCoords;

  const arrAirportCoords = globalStore.airportData.get(arrAirport)[1];
  const [arrLon, arrLat] = arrAirportCoords;

  const dep = createMarker(depLon, depLat);
  const arr = createMarker(arrLon, arrLat);

  CameraController.moveToAirport(depLon, depLat);

  const depPair = {[depAirport]: dep};
  const arrPair = {[arrAirport]: arr};

  return [[depPair, arrPair]]
}

export function clearSearchBar(inputId){
  const inputBox = document.getElementById(inputId);
  inputBox.value = '';
}