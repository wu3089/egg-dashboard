// script.js

// URL for your local CSV file containing historical FRED data.
const dataUrl = 'fredData.csv';

console.log("Fetching historical FRED data from:", dataUrl);

let fullObservations = [];
let chart = null;

async function fetchFREDData() {
  try {
    // Show loading indicator (ensure your HTML has an element with id="loading")
    document.getElementById('loading').style.display = 'block';

    // Fetch the CSV file
    const response = await fetch(dataUrl);
    console.log("Fetch response received. Status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read the response as text
    const csvText = await response.text();
    console.log("CSV text received:", csvText.substring(0, 100) + "..."); // log first 100 characters for debugging

    // Parse the CSV using Papa Parse
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    console.log("Parsed CSV data (first 5 rows):", parsed.data.slice(0, 5));

    // Hide the loading indicator
    document.getElementById('loading').style.display = 'none';

    // Map CSV data to our expected format
    // Expected headers: period_start_date, APU0000708111, realtime_start_date
    fullObservations = parsed.data.map(row => ({
      date: row.period_start_date,
      value: row["APU0000708111"]
    }));

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
    console.error('Error fetching historical FRED data:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').textContent = 'Failed to load data. Please try again later.';
  }
}

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
        borderColor: '#000',  // minimalistic black line
        tension: 0.4,         // smooth curve
        pointRadius: 0        // hide point markers for a cleaner look
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: 'Date', color: '#000', font: { size: 14, weight: 'bold' } },
          ticks: { color: '#000' },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: 'Egg Price ($)', color: '#000', font: { size: 14, weight: 'bold' } },
          ticks: { color: '#000', callback: value => '$' + value },
          grid: { color: '#ccc' }
        }
      }
    }
  });
  console.log("Chart created.");
}

function updateChart(observations) {
  const labels = observations.map(obs => obs.date);
  const values = observations.map(obs => parseFloat(obs.value));
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
  console.log("Chart updated with", observations.length, "observations.");
}

function filterObservations(yearsBack) {
  const now = new Date();
  const threshold = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
  return fullObservations.filter(obs => new Date(obs.date) >= threshold);
}

function addFilterListeners() {
  document.getElementById('btn1Year').addEventListener('click', () => updateChart(filterObservations(1)));
  document.getElementById('btn3Years').addEventListener('click', () => updateChart(filterObservations(3)));
  document.getElementById('btn5Years').addEventListener('click', () => updateChart(filterObservations(5)));
  document.getElementById('btnAll').addEventListener('click', () => updateChart(fullObservations));
}

window.onload = fetchFREDData;