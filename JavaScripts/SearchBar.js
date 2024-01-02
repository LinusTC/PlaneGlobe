import { addPingForSelectedAirport } from "./main.js";
export function setupSearchBar(airportNames, selectedAirport) {
    const resultsBox = document.querySelector(".result-box");
    const inputBox = document.getElementById("input-box");
  
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
        return "<li onclick=selectInput(this)>" + list + "</li>";
      });
      resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
    }
  
    window.selectInput = function (list) {
        inputBox.value = list.innerHTML;
        selectedAirport = list.innerHTML;
        resultsBox.innerHTML = '';
        addPingForSelectedAirport(selectedAirport);
    };
}
  