// script.js

// The local JSON file containing your historical FRED data.
const dataUrl = 'fredData.json';

console.log("Fetching historical FRED data from:", dataUrl);

let fullObservations = [];
let chart = null;

async function fetchFREDData() {
  try {
    // If you have a loading indicator in your HTML, uncomment the line below:
    // document.getElementById('loading').style.display = 'block';

    const response = await fetch(dataUrl);
    console.log("Fetch response received. Status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON
    const data = await response.json();
    console.log("JSON data received (first few observations):", data.observations.slice(0, 5));

    // Hide loading indicator if you have one
    // document.getElementById('loading').style.display = 'none';

    // The JSON has an "observations" property
    fullObservations = data.observations;
    if (!fullObservations || fullObservations.length === 0) {
      document.getElementById('error-message').textContent = 'No data available.';
      return;
    }

    // Default: filter to show only 1 year back
    const initialObservations = filterObservations(1);
    createChart(initialObservations);

    // Set up interactive filter buttons
    addFilterListeners();
  } catch (error) {
    console.error('Error fetching historical FRED data:', error);
    // If you have a loading indicator:
    // document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').textContent = 'Failed to load data. Please try again later.';
  }
}

function createChart(observations) {
  // Map your JSON data
  const labels = observations.map(obs => obs.period_start_date);
  const values = observations.map(obs => parseFloat(obs["APU0000708111"]));

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
        tension: 0.4,        // smooth curve
        pointRadius: 0       // hide data point markers
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: '#000',
            font: { size: 14, weight: 'bold' }
          },
          ticks: { color: '#000' },
          grid: { display: false }
        },
        y: {
          title: {
            display: true,
            text: 'Egg Price ($)',
            color: '#000',
            font: { size: 14, weight: 'bold' }
          },
          ticks: {
            color: '#000',
            callback: value => '$' + value
          },
          grid: { color: '#ccc' }
        }
      }
    }
  });
  console.log("Chart created.");
}

function updateChart(observations) {
  const labels = observations.map(obs => obs.period_start_date);
  const values = observations.map(obs => parseFloat(obs["APU0000708111"]));

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
  console.log("Chart updated with", observations.length, "observations.");
}

function filterObservations(yearsBack) {
  const now = new Date();
  const threshold = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
  // Compare threshold to obs.period_start_date
  return fullObservations.filter(obs => new Date(obs.period_start_date) >= threshold);
}

function addFilterListeners() {
  document.getElementById('btn1Year').addEventListener('click', () => updateChart(filterObservations(1)));
  document.getElementById('btn3Years').addEventListener('click', () => updateChart(filterObservations(3)));
  document.getElementById('btn5Years').addEventListener('click', () => updateChart(filterObservations(5)));
  document.getElementById('btnAll').addEventListener('click', () => updateChart(fullObservations));
}

// Fetch data on page load
window.onload = fetchFREDData;

// Ensure the elements exist in your HTML
const addEggBtn = document.getElementById('add-egg-btn');
const eggCountEl = document.getElementById('egg-count');

let eggCount = 0;

if (addEggBtn && eggCountEl) {
  addEggBtn.addEventListener('click', () => {
    eggCount++;
    eggCountEl.textContent = eggCount;
    
    // Add bounce animation
    eggCountEl.classList.add('egg-bounce');
    setTimeout(() => {
      eggCountEl.classList.remove('egg-bounce');
    }, 400);
  });
}