import { addPingForSelectedAirport } from "./main.js";

export function setUpStart(airportNames, selectedAirport, pingColor) {
  const resultsBox = document.querySelector(".result-box-start");
  const inputBox = document.getElementById("input-box-start");

  inputBox.onkeyup = function () {
    let results = [];
    let input = inputBox.value;
    if (input.length) {
      results = airportNames.filter((keyword) => {
        return keyword.toLowerCase().includes(input.toLowerCase());
      });
    }
    displayResult(results);

    if (!results.length) {
      resultsBox.innerHTML = '';
    }
  };

  function displayResult(result) {
    const content = result.map((list) => {
      return "<li onclick=selectInputStart(this)>" + list + "</li>";
    });
    resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
  }

  window.selectInputStart = function (list) {
      inputBox.value = list.innerHTML;
      selectedAirport = list.innerHTML;
      resultsBox.innerHTML = '';
      addPingForSelectedAirport(selectedAirport, pingColor);
  };
}

export function setUpEnd(airportNames, selectedAirport, pingColor) {
  const resultsBox = document.querySelector(".result-box-end");
  const inputBox = document.getElementById("input-box-end");

  inputBox.onkeyup = function () {
    let results = [];
    let input = inputBox.value;
    if (input.length) {
      results = airportNames.filter((keyword) => {
        return keyword.toLowerCase().includes(input.toLowerCase());
      });
    }
    displayResult(results);

    if (!results.length) {
      resultsBox.innerHTML = '';
    }
  };

  function displayResult(result) {
    const content = result.map((list) => {
      return "<li onclick=selectInputEnd(this)>" + list + "</li>";
    });
    resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
  }

  window.selectInputEnd = function (list) {
    inputBox.value = list.innerHTML;
    selectedAirport = list.innerHTML;
    resultsBox.innerHTML = '';
    addPingForSelectedAirport(selectedAirport, pingColor);
  };
}
  