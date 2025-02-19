// script.js

// ---------- FRED DATA & CHART ----------
const dataUrl = 'fredData.json';
let fullObservations = [];
let chart = null;

async function fetchFREDData() {
  try {
    const response = await fetch(dataUrl);
    console.log("Fetch response received. Status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("JSON data received (first few observations):", data.observations.slice(0, 5));
    fullObservations = data.observations;
    if (!fullObservations || fullObservations.length === 0) {
      document.getElementById('error-message').textContent = 'No data available.';
      return;
    }
    const initialObservations = filterObservations(1);
    createChart(initialObservations);
    addFilterListeners();
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    document.getElementById('error-message').textContent = 'Failed to load data. Please try again later.';
  }
}

function createChart(observations) {
  const labels = observations.map(obs => obs.period_start_date);
  const values = observations.map(obs => parseFloat(obs["APU0000708111"]));
  const ctx = document.getElementById('dataChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
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
  return fullObservations.filter(obs => new Date(obs.period_start_date) >= threshold);
}

function addFilterListeners() {
  document.getElementById('btn1Year').addEventListener('click', () => updateChart(filterObservations(1)));
  document.getElementById('btn3Years').addEventListener('click', () => updateChart(filterObservations(3)));
  document.getElementById('btn5Years').addEventListener('click', () => updateChart(filterObservations(5)));
  document.getElementById('btnAll').addEventListener('click', () => updateChart(fullObservations));
}

window.onload = fetchFREDData;

// ---------- INTERACTIVE CART & MONEY TICKER ----------
const PRICE_PER_EGG = 0.498;
const addEggBtn = document.getElementById('add-egg-btn');
const eggCountEl = document.getElementById('egg-count');
const flyingEggEl = document.getElementById('flying-egg');
const cartIconImage = document.getElementById('cart-icon-image');
const moneyTickerEl = document.getElementById('money-ticker');
const productBoxEl = document.getElementById('product-box');

let eggCount = 0;

if (addEggBtn && eggCountEl && flyingEggEl && cartIconImage && moneyTickerEl && productBoxEl) {
  addEggBtn.addEventListener('click', () => {
    eggCount++;
    eggCountEl.textContent = eggCount;
    updateMoneyTicker();
    eggCountEl.classList.add('egg-bounce');
    setTimeout(() => {
      eggCountEl.classList.remove('egg-bounce');
    }, 400);
    animateFlyingEgg();
  });
}

function updateMoneyTicker() {
  const totalCost = eggCount * PRICE_PER_EGG;
  moneyTickerEl.textContent = `$${totalCost.toFixed(2)}`;
  moneyTickerEl.classList.add('money-bounce');
  setTimeout(() => {
    moneyTickerEl.classList.remove('money-bounce');
  }, 400);
}

function animateFlyingEgg() {
  const btnRect = addEggBtn.getBoundingClientRect();
  const cartRect = cartIconImage.getBoundingClientRect();
  const productBoxRect = productBoxEl.getBoundingClientRect();
  const startX = btnRect.left + (btnRect.width / 2) - productBoxRect.left;
  const startY = btnRect.top + (btnRect.height / 2) - productBoxRect.top;
  const endX = cartRect.left + (cartRect.width / 2) - productBoxRect.left;
  const endY = cartRect.top + (cartRect.height / 2) - productBoxRect.top - 10;
  flyingEggEl.style.left = `${startX}px`;
  flyingEggEl.style.top = `${startY}px`;
  flyingEggEl.style.display = 'inline';
  let startTime;
  const duration = 600;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;
    flyingEggEl.style.left = `${currentX}px`;
    flyingEggEl.style.top = `${currentY}px`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      explodeEgg();
    }
  }
  requestAnimationFrame(step);
}

function explodeEgg() {
  flyingEggEl.style.animation = 'explodeEgg 0.4s forwards';
  setTimeout(() => {
    flyingEggEl.style.display = 'none';
    flyingEggEl.style.animation = '';
  }, 400);
}