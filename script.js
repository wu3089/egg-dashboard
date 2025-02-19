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

/* --- Interactive Cart Functionality --- */
const addEggBtn = document.getElementById('add-egg-btn');
const eggCountEl = document.getElementById('egg-count');
const flyingEggEl = document.getElementById('flying-egg');
const cartIconImage = document.getElementById('cart-icon-image');

let eggCount = 0;

if (addEggBtn && eggCountEl && flyingEggEl && cartIconImage) {
  addEggBtn.addEventListener('click', () => {
    eggCount++;
    eggCountEl.textContent = eggCount;

    // Bounce the egg count badge
    eggCountEl.classList.add('egg-bounce');
    setTimeout(() => {
      eggCountEl.classList.remove('egg-bounce');
    }, 400);

    // Trigger flying egg animation
    animateFlyingEgg();
  });
}

function animateFlyingEgg() {
  // Get positions of the Add Egg button and the cart icon
  const btnRect = addEggBtn.getBoundingClientRect();
  const cartRect = cartIconImage.getBoundingClientRect();

  // Calculate starting position (center of the button)
  const startX = btnRect.left + (btnRect.width / 2);
  const startY = btnRect.top + (btnRect.height / 2);
  // Calculate ending position (center of the cart icon)
  const endX = cartRect.left + (cartRect.width / 2);
  const endY = cartRect.top + (cartRect.height / 2);

  // Place the flying egg at the start position
  flyingEggEl.style.left = startX + 'px';
  flyingEggEl.style.top = startY + 'px';
  flyingEggEl.style.display = 'inline';  // Show the egg

  let startTime;
  const duration = 600; // animation duration in ms

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // Calculate current position
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;
    flyingEggEl.style.left = currentX + 'px';
    flyingEggEl.style.top = currentY + 'px';

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Once the egg reaches the cart, trigger the explode animation
      explodeEgg();
    }
  }
  requestAnimationFrame(step);
}

function explodeEgg() {
  // Apply the explode animation (defined in CSS)
  flyingEggEl.style.animation = 'explodeEgg 0.4s forwards';

  setTimeout(() => {
    // Hide and reset the flying egg element after the animation
    flyingEggEl.style.display = 'none';
    flyingEggEl.style.animation = '';
  }, 400);
}