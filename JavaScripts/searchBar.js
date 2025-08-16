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
