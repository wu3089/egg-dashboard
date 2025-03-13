// FRED data and chart functionality

const dataUrl = '../fredData.json'; // CORRECTED PATH
let fullObservations = [];
let chart = null;

export function initFredChart() {
  fetchFREDData();
  addFilterListeners(); // Make sure this function is defined
}

async function fetchFREDData() {
  try {
    const response = await fetch(dataUrl);
    console.log("Fetch response received. Status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    fullObservations = data.observations;
    if (!fullObservations || fullObservations.length === 0) {
      document.getElementById('error-message').textContent = 'No data available.';
      return;
    }
    const initialObservations = filterObservations(1); // Make sure this is defined
    createChart(initialObservations);
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    document.getElementById('error-message').textContent = 'Failed to load data. Please try again later.';
  }
}


// Helper function to format a date string as "M/YYYY"
function formatDateLabel(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 0-indexed
  const year = date.getFullYear();
  return `${month}/${year}`;
}

function createChart(observations) {

  // Map your JSON data with formatted date labels
  const labels = observations.map(obs => formatDateLabel(obs.period_start_date));
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
        borderColor: '#000',
        tension: 0.4,
        pointRadius: 0
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
  const labels = observations.map(obs => formatDateLabel(obs.period_start_date));
  const values = observations.map(obs => parseFloat(obs["APU0000708111"]));
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
  console.log("Chart updated with", observations.length, "observations.");
}

function filterObservations(yearsBack) {
  const now = new Date();
  const threshold = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
  return fullObservations.filter(obs => new Date(obs.period_start_date) >= threshold);
}

function addFilterListeners() {
  document.getElementById('btn1Year')?.addEventListener('click', () => updateChart(filterObservations(1)));
  document.getElementById('btn3Years')?.addEventListener('click', () => updateChart(filterObservations(3)));
  document.getElementById('btn5Years')?.addEventListener('click', () => updateChart(filterObservations(5)));
  document.getElementById('btnAll')?.addEventListener('click', () => updateChart(fullObservations));
}