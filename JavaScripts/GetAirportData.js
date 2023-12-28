async function fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return Object.values(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }
export { fetchData };