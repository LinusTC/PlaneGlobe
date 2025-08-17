export async function getData() {
  const response = await fetch('./data/airports.json');
  const allData = await response.json();

  const airportData = new Map();
  const airportNames = [];
  
  for (let i = 0; i < allData.length; i++) {
    if (allData[i].status == 0) continue;
    if (allData[i].lon == null || allData[i].lat == null || allData[i].name == null) continue;

    airportData.set(allData[i].name, [allData[i].lon, allData[i].lat]);
    airportNames.push(allData[i].name);
  }

  return { airportData, airportNames };
}