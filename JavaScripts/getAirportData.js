export async function getAirportData() {
  const response = await fetch('./data/airports.json');
  const allData = await response.json();

  const airportData = new Map();
  const airportCodes = new Map();
  
  for (const airportKey in allData) {
    if (allData[airportKey].status == 0) continue;
    if (!allData[airportKey].lon|| !allData[airportKey].lat|| !allData[airportKey].name|| !allData[airportKey].iata) continue;

    airportData.set(allData[airportKey].iata, [allData[airportKey].name, [allData[airportKey].lon, allData[airportKey].lat]]);
    airportCodes.set(allData[airportKey].iata, allData[airportKey].name);
  }  
  return { airportData, airportCodes };
}

export async function getRouteData() {
  const response = await fetch("./data/routes.dat");
  const text = await response.text();

  const lines = text.split("\n").filter(line => line.trim() !== "");

  const routes = lines.map(line => {
    const parts = line.split(",");
    return [parts[2], parts[4]];
  });

  const uniqueRoutesMap = new Map();

  routes.forEach(([dep, arr]) => {
    const key = [dep, arr].sort().join("-");
    if (!uniqueRoutesMap.has(key)) {
      uniqueRoutesMap.set(key, [dep, arr]);
    }
  });

  const uniqueRoutes = Array.from(uniqueRoutesMap.values());

  return uniqueRoutes;
}
