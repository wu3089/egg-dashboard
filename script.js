// script.js

// Replace 'YOUR_API_KEY' with your actual FRED API key.
const apiKey = 'e2685f0089057c42bba0f40e745783cd';
const seriesId = 'APU0000708111';
const apiUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

console.log("Script is running.");
console.log("Fetching from API:", apiUrl);

// Function to fetch data from the FRED API
async function fetchFREDData() {
  try {
    console.log("Starting fetchFREDData.");
    // Show the loading indicator
    const loadingEl = document.getElementById('loading');
    loadingEl.style.display = 'block';
    console.log("Loading indicator shown.");

    // Execute fetch
    const response = await fetch(apiUrl);
    console.log("Fetch response received. Status:", response.status);

    if (!response.ok) {
      console.error("Response not OK. Status:", response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("JSON data received:", data);

    // Hide the loading indicator
    loadingEl.style.display = 'none';

    const observations = data.observations;
    if (!observations || observations.length === 0) {
      document.getElementById('error-message').textContent = 'No data available.';
      return;
    }

    // Populate the data table
    populateDataTable(observations);

    // Create the chart
    createChart(observations);
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').textContent = 'Failed to load data. Please try again later.';
  }
}

// Function to populate the data table
function populateDataTable(observations) {
  const tableBody = document.getElementById('data-table-body');
  tableBody.innerHTML = ''; // Clear previous data if any

  observations.forEach(obs => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${obs.date}</td><td>${obs.value}</td>`;
    tableBody.appendChild(row);
  });
  console.log("Data table populated with", observations.length, "rows.");
}

// Function to create a chart using Chart.js
function createChart(observations) {
  // Prepare data for the chart.
  // For a time series chart, we extract dates and corresponding values.
  const labels = observations.map(obs => obs.date);
  const values = observations.map(obs => parseFloat(obs.value));

  const ctx = document.getElementById('dataChart').getContext('2d');
  console.log("Creating chart with", labels.length, "labels and", values.length, "values.");

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'FRED Data',
        data: values,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
          // For a time scale, consider using a date adapter if needed.
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });
  console.log("Chart created.");
}

// Fetch data when the page loads
window.onload = fetchFREDData;
