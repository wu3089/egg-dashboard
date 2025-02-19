// script.js

// Replace 'YOUR_API_KEY' with your actual FRED API key.
const apiKey = 'e2685f0089057c42bba0f40e745783cd';
const seriesId = 'APU0000708111';

// Use CORS Anywhere as a proxy to bypass CORS restrictions.
// Make sure you have requested temporary access at: https://cors-anywhere.herokuapp.com/corsdemo
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;
const apiUrl = proxyUrl + fredUrl;

console.log("Final API URL:", apiUrl);
console.log("Script is running.");
console.log("Fetching from API via CORS Anywhere:", apiUrl);

// Global variables to store the full data and the Chart instance.
let fullObservations = [];
let chart = null;

// Fetch data from FRED API using the proxy.
async function fetchFREDData() {
  try {
    document.getElementById('loading').style.display = 'block';

    const response = await fetch(apiUrl);
    console.log("Fetch response received. Status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("JSON data received:", data);

    document.getElementById('loading').style.display = 'none';

    // Store the full dataset (FRED returns observations in the "observations" property)
    fullObservations = data.observations;
    if (!fullObservations || fullObservations.length === 0) {
      document.getElementById('error-message').textContent = 'No data available.';
      return;
    }

    // Default: filter to show only 1 year back
    const initialObservations = filterObservations(1);
    createChart(initialObservations);

    // Set up interactive filter buttons.
    addFilterListeners();
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').textContent = 'Failed to load data. Please try again later.';
  }
}

// Create a Chart.js line chart with the provided observations.
function createChart(observations) {
  const labels = observations.map(obs => obs.date);
  const values = observations.map(obs => parseFloat(obs.value));

  const ctx = document.getElementById('dataChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Egg Price',
        data: values,
        fill: false,
        borderColor: '#000', // black line
        tension: 0.4,        // smooth line curve
        pointRadius: 0       // hide data point markers for a cleaner look
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false // hide the legend for a minimalistic style
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: '#000',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            color: '#000'
          },
          grid: {
            display: false // remove x-axis grid lines
          }
        },
        y: {
          title: {
            display: true,
            text: 'Egg Price ($)',
            color: '#000',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            color: '#000',
            callback: function(value) {
              return '$' + value;
            }
          },
          grid: {
            color: '#ccc' // light gray grid lines for subtle guidance
          }
        }
      }
    }
  });
  console.log("Chart created.");
}

// Update the chart with a new set of observations.
function updateChart(observations) {
  const labels = observations.map(obs => obs.date);
  const values = observations.map(obs => parseFloat(obs.value));

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
  console.log("Chart updated with", observations.length, "observations.");
}

// Filter observations to only include data from the past "yearsBack" years.
function filterObservations(yearsBack) {
  const now = new Date();
  const threshold = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
  return fullObservations.filter(obs => {
    const obsDate = new Date(obs.date);
    return obsDate >= threshold;
  });
}

// Set up event listeners for the interactive filter buttons.
function addFilterListeners() {
  document.getElementById('btn1Year').addEventListener('click', () => {
    const filtered = filterObservations(1);
    updateChart(filtered);
  });

  document.getElementById('btn3Years').addEventListener('click', () => {
    const filtered = filterObservations(3);
    updateChart(filtered);
  });

  document.getElementById('btn5Years').addEventListener('click', () => {
    const filtered = filterObservations(5);
    updateChart(filtered);
  });

  document.getElementById('btnAll').addEventListener('click', () => {
    updateChart(fullObservations);
  });
}

// Fetch data when the page loads.
window.onload = fetchFREDData;
