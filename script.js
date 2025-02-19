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
  document.getElementById('btn1Year').addEventListener('click', () => updateChart(filterObservations(1)));
  document.getElementById('btn3Years').addEventListener('click', () => updateChart(filterObservations(3)));
  document.getElementById('btn5Years').addEventListener('click', () => updateChart(filterObservations(5)));
  document.getElementById('btnAll').addEventListener('click', () => updateChart(fullObservations));
}

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

// ---------- STORE PRICES ----------
const storePrices = {
  walmart: 3.29,  // Example prices - UPDATE THESE to current prices!
  kroger: 3.49,   // You'll need to check actual prices at these stores
  target: 3.79,
};

const walmartPriceEl = document.getElementById('walmart-price');
const krogerPriceEl = document.getElementById('kroger-price');
const targetPriceEl = document.getElementById('target-price');

function displayStorePrices() {
  if (walmartPriceEl && krogerPriceEl && targetPriceEl) {
    walmartPriceEl.textContent = `$${storePrices.walmart.toFixed(2)}/dozen`;
    krogerPriceEl.textContent = `$${storePrices.kroger.toFixed(2)}/dozen`;
    targetPriceEl.textContent = `$${storePrices.target.toFixed(2)}/dozen`;
  }
}

// ---------- MARKET CONCENTRATION CHART (UPDATED for Top 25 + "Other" Pie Chart) ----------
function createMarketShareChart() {
  const ctxMarketShare = document.getElementById('marketShareChart').getContext('2d');

  // Data from WATT Global Media, 2024 Company Survey (TOP 25 ONLY initially)
  const top25CompanyHensData = [
    { company: 'Cal-Maine Foods', hens: 44.51 },
    { company: 'Rose Acre Farms', hens: 25.50 },
    { company: 'Daybreak Foods Inc.', hens: 20.50 },
    { company: 'Hillandale Farms', hens: 18.75 },
    { company: 'Versova Holdings LLP', hens: 18.45 },
    { company: 'MPS Egg Farms', hens: 13.64 },
    { company: 'Center Fresh Group', hens: 12.53 },
    { company: 'Mid-States Specialty Eggs', hens: 10.30 },
    { company: 'Michael Foods', hens: 9.70 },
    { company: 'Herbruck’s Poultry Ranch', hens: 9.53 },
    { company: 'Gemperle Family Farms', hens: 8.80 },
    { company: 'Prairie Star Farms', hens: 7.91 },
    { company: 'Sauder’s Eggs', hens: 7.63 },
    { company: 'Kreider Farms', hens: 7.10 },
    { company: 'Opal Foods', hens: 7.01 },
    { company: 'Fremont Farms of Iowa', hens: 6.00 },
    { company: 'Hickman’s Egg Ranch', hens: 6.00 },
    { company: 'Cooper Farms', hens: 5.93 },
    { company: 'Vital Farms', hens: 5.70 },
    { company: 'Hidden Villa Ranch', hens: 5.50 },
    { company: 'Sunrise Farms Inc.', hens: 5.00 },
    { company: 'S&R Egg Farm', hens: 4.85 },
    { company: 'ISE America', hens: 4.70 },
    { company: 'Wabash Valley Produce', hens: 4.62 },
    { company: 'Weaver Brothers', hens: 4.44 },
  ];

  // Data for companies ranked 26th and below (calculate "Other" category)
  const otherCompaniesData = [
    { company: 'Minnich Poultry LLC', hens: 3.87 },
    { company: 'Forsman Farms', hens: 3.72 },
    { company: 'Ritewood/Oakdell Egg Farms', hens: 3.42 },
    { company: 'Sparboe Farms', hens: 3.24 },
    { company: 'Creighton Brothers LLC', hens: 3.20 },
    { company: 'Hamilton Eggs Holdings LLC', hens: 2.35 },
    { company: 'Central Valley Eggs', hens: 2.31 },
    { company: 'Giroux’s Poultry Farm', hens: 2.30 },
    { company: 'Sunrise Acres Inc.', hens: 2.17 },
    { company: 'Willamette Egg Farm', hens: 2.05 },
    { company: 'Rembrandt Enterprises', hens: 2.00 },
    { company: 'Kreher’s Farm Fresh Eggs LLC', hens: 1.96 },
    { company: 'Pearl Valley Eggs', hens: 1.94 },
    { company: 'Braswell Egg', hens: 1.86 },
    { company: 'Demler Enterprises', hens: 1.70 },
    { company: 'Egg Innovations', hens: 1.70 },
    { company: 'Heritage PMS/LaValle Egg Farms', hens: 1.68 },
    { company: 'Simpson’s Eggs', hens: 1.59 },
    { company: 'Dutt & Wagner', hens: 1.51 },
    { company: 'Berne Hi-Way Hatchery Inc.', hens: 1.50 },
    { company: 'Demler Brothers LLC', hens: 1.50 },
    { company: 'Lathem Farms', hens: 1.50 },
    { company: 'Dutchland Farms', hens: 1.42 },
    { company: 'Hertzfeld Poultry Farms Inc.', hens: 1.35 },
    { company: 'Mercer Landmark', hens: 1.34 },
    { company: 'Dakota Layers LLP', hens: 1.31 },
    { company: 'J.S. West Milling', hens: 1.30 },
    { company: 'Morning Fresh Farms', hens: 1.06 },
    { company: '3 Puglisi Brothers', hens: 1.03 },
    { company: 'Farmers Hen House', hens: 0.95 },
    { company: 'Wilcox Farms', hens: 0.90 },
    { company: 'Demler Farms', hens: 0.80 },
    { company: 'Chino Valley Ranchers/MCM Poultry', hens: 0.72 },
    { company: 'Hillside Poultry Farms Inc.', hens: 0.65 },
    { company: 'Colorado Eggs', hens: 0.59 },
    { company: 'Weber Family Farms', hens: 0.58 },
    { company: 'Sunrise Farms LLC', hens: 0.24 },
    { company: 'The Happy Egg Co.', hens: 0.19 },
  ];

  // Calculate total hens for "Other" category (companies ranked 26th and below)
  const otherHensTotal = otherCompaniesData.reduce((sum, company) => sum + company.hens, 0);

  // Create final data array: Top 25 + "Other" category
  const companyHensData = [
    ...top25CompanyHensData, // Spread operator to include top 25
    { company: 'Other (Rank 26-63)', hens: otherHensTotal } // Add "Other" category
  ];

  // Sort data by hen count in ascending order for better chart visualization (largest to smallest for pie)
  companyHensData.sort((a, b) => b.hens - a.hens);

  const companyNames = companyHensData.map(item => item.company);
  const henCounts = companyHensData.map(item => item.hens);

  new Chart(ctxMarketShare, {
    type: 'pie', // Changed to Pie Chart!
    data: {
      labels: companyNames,
      datasets: [{
        label: 'Hens (Millions)',
        data: henCounts,
        // Example colors - you can customize these!
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // Red
          'rgba(54, 162, 235, 0.8)',  // Blue
          'rgba(255, 206, 86, 0.8)', // Yellow
          'rgba(75, 192, 192, 0.8)',  // Green
          'rgba(153, 102, 255, 0.8)', // Purple
          'rgba(255, 159, 64, 0.8)',  // Orange
          'rgba(199, 199, 199, 0.8)', // Light Gray
          'rgba(102, 204, 255, 0.8)', // Light Blue
          'rgba(255, 178, 102, 0.8)', // Peach
          'rgba(178, 102, 255, 0.8)', // Lavender
          'rgba(255, 99, 132, 0.6)',  // Lighter Red
          'rgba(54, 162, 235, 0.6)',  // Lighter Blue
          'rgba(255, 206, 86, 0.6)', // Lighter Yellow
          'rgba(75, 192, 192, 0.6)',  // Lighter Green
          'rgba(153, 102, 255, 0.6)', // Lighter Purple
          'rgba(255, 159, 64, 0.6)',  // Lighter Orange
          'rgba(199, 199, 199, 0.6)', // Lighter Gray
          'rgba(102, 204, 255, 0.6)', // Lighter Blue
          'rgba(255, 178, 102, 0.6)', // Lighter Peach
          'rgba(178, 102, 255, 0.6)', // Lighter Lavender
          'rgba(255, 99, 132, 0.4)',  // Even Lighter Red
          'rgba(54, 162, 235, 0.4)',  // Even Lighter Blue
          'rgba(255, 206, 86, 0.4)', // Even Lighter Yellow
          'rgba(75, 192, 192, 0.4)',  // Even Lighter Green
          'rgba(153, 102, 255, 0.4)', // Even Lighter Purple
          'rgba(220,220,220, 0.8)'     // Lightest Gray for "Other"
        ],
        borderColor: 'rgba(255, 255, 255, 1)', // White border for slices
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right', // Display legend on the right side
          labels: {
            boxWidth: 20,  // Adjust legend box width if needed
            fontColor: '#333' // Legend text color
          }
        },
        title: {
          display: false, // You can enable title if needed
          text: 'US Egg Market Concentration (Top 25 Producers + Other)'
        }
      }
    }
  });
}

window.onload = () => {
  fetchFREDData(); // Keep your FRED data fetching
  displayStorePrices(); // Keep displaying store prices
  createMarketShareChart(); // Call function to create market share chart
};