import { globalStore } from "./main.js";
import { createMarker, getXYZCoordinate } from "./markers&PathsFunctions.js";
import * as THREE from 'three';
import { CameraController } from "./cameraControls.js";

export function setUpAutocomplete(airportNames, inputId, resultsBoxSelector, onSelect) {
  const resultsBox = document.querySelector(resultsBoxSelector);
  const inputBox = document.getElementById(inputId);

  inputBox.onkeyup = function () {
    let input = inputBox.value.trim();
    let results = input.length
      ? airportNames.filter((keyword) =>
          keyword.toLowerCase().includes(input.toLowerCase())
        )
      : [];

    displayResult(results);
    if (!results.length) resultsBox.innerHTML = '';
  };

  function displayResult(result) {
    resultsBox.innerHTML = `<ul>${result
      .map((list) => `<li>${list}</li>`)
      .join('')}</ul>`;

    resultsBox.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', () => {
        inputBox.value = li.textContent;
        resultsBox.innerHTML = '';
        if (onSelect) onSelect(li.textContent);
      });
    });
  }
}

export function clickMap(depAirport, arrAirport, CameraController){
  if (depAirport == null || arrAirport == null)return;

  else{
    const depAirportCoords = globalStore.airportData.get(depAirport);
    const [depLon, depLat] = depAirportCoords;

    const arrAirportCoords = globalStore.airportData.get(arrAirport);
    const [arrLon, arrLat] = arrAirportCoords;

    const dep = createMarker(depLon, depLat);
    const arr = createMarker(arrLon, arrLat);

    CameraController.moveToAirport(depLon, depLat);

    return [dep, arr]
  }
}