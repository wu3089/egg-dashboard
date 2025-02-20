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
  walmart: 5.47,  // Example prices - UPDATE THESE to current prices!
  kroger: 5.69,   // You'll need to check actual prices at these stores
  target: 5.49,
};

const walmartPriceEl = document.getElementById('walmart-price');
const krogerPriceEl = document.getElementById('kroger-price');
const targetPriceEl = document.getElementById('target-price');

function displayStorePrices() {
  if (walmartPriceEl && krogerPriceEl && targetPriceEl) {
    walmartPriceEl.textContent = `$${storePrices.walmart.toFixed(2)}/dozen`;
    krogerPriceEl.textContent = `$${storePrices.kroger.toFixed(2)}/dozen`;
    targetPriceEl.textContent = `$${storePrices.target.toFixed(2)}/dozen`; // CORRECTED: storePrices.target (lowercase 't')
  }
}

// ---------- MARKET CONCENTRATION CHART (UPDATED - Outside Labels, Clean - DIRECT ACCESS to totalHensAllCompanies) ----------
function createMarketShareChart() {
  const ctxMarketShare = document.getElementById('marketShareChart').getContext('2d');

  // Data from WATT Global Media, 2025 Company Survey (TOP 20 ONLY)
  const top20CompanyHensData = [
    { company: 'Cal-Maine Foods', hens: 50.61 },
    { company: 'Rose Acre Farms', hens: 25.50 },
    { company: 'Daybreak Foods Inc.', hens: 23.30 },
    { company: 'Hillandale Farms', hens: 18.34 },
    { company: 'Mid-States Specialty Eggs', hens: 15.00 },
    { company: 'MPS Egg Farms', hens: 13.30 },
    { company: 'Center Fresh Group', hens: 12.50 },
    { company: 'Opal Foods', hens: 12.36 },
    { company: 'Prairie Star Farms', hens: 12.20 },
    { company: 'Trillium Farm Holdings', hens: 11.50 },
    { company: 'Herbruck\'s Poultry Ranch', hens: 10.80 },
    { company: 'Michael Foods', hens: 9.70 },
    { company: 'Gemperle Family Farms', hens: 9.20 },
    { company: 'Kreider Farms', hens: 8.40 },
    { company: 'Sauder’s Eggs', hens: 7.41 },
    { company: 'Cooper Farms', hens: 7.24 },
    { company: 'Fremont Farms of Iowa', hens: 7.00 },
    { company: 'Hickman\'s Egg Ranch', hens: 6.00 },
    { company: 'Vital Farms', hens: 5.70 },
    { company: 'Iowa Cage Free', hens: 5.50 },
  ];

  // Data for companies ranked 21st and below (calculate "Other" category)
  const otherCompaniesData = [
    { company: 'Sunrise Farms Inc.', hens: 5.00 },
    { company: 'S&R Egg Farm', hens: 4.85 },
    { company: 'Weaver Brothers', hens: 4.62 },
    { company: 'Hidden Villa Ranch', hens: 4.00 },
    { company: 'Wabash Valley Produce', hens: 3.95 },
    { company: 'Minnich Eggs', hens: 3.75 },
    { company: 'Centrum Valley Egg Farm', hens: 3.70 },
    { company: 'The Happy Egg Co.', hens: 3.70 },
    { company: 'Forsman Farms', hens: 3.56 },
    { company: 'Creighton Brothers LLC', hens: 3.20 },
    { company: 'Mercer Landmark', hens: 2.61 },
    { company: 'Kreher\'s Farm Fresh Eggs LLC', hens: 2.43 },
    { company: 'Giroux\'s Poultry Farm', hens: 2.40 },
    { company: 'Oakdell Egg Farms', hens: 2.40 },
    { company: 'Central Valley Eggs', hens: 2.31 },
    { company: 'Braswell Family Farms', hens: 2.21 },
    { company: 'Sunrise Acres Inc.', hens: 2.20 },
    { company: 'Dutchland Farms', hens: 2.16 },
    { company: 'Willamette Egg Farm', hens: 2.05 },
    { company: 'Rembrandt Enterprises', hens: 2.00 },
    { company: 'Pearl Valley Eggs', hens: 1.95 },
    { company: 'Demler Enterprises', hens: 1.70 },
    { company: 'Dutt & Wagner', hens: 1.60 },
    { company: 'Simpson\'s Eggs', hens: 1.59 },
    { company: 'Heritage PMS/LaValle Egg Farms', hens: 1.57 },
    { company: 'Lathem Farms', hens: 1.57 },
    { company: 'Hertzfeld Poultry Farms Inc.', hens: 1.51 },
    { company: 'Berne Hi-Way Hatchery Inc.', hens: 1.50 },
    { company: 'Demler Brothers LLC', hens: 1.50 },
    { company: 'Hamilton Eggs Holdings LLC', hens: 1.50 },
    { company: 'Dakota Layers LLP', hens: 1.31 },
    { company: 'J.S. West Milling', hens: 1.30 },
    { company: 'Demler Farms', hens: 1.15 },
    { company: 'Farmers Hen House', hens: 1.15 },
    { company: '3 Puglisi Brothers', hens: 1.08 },
    { company: 'Weber Family Farms', hens: 0.91 },
    { company: 'Morning Fresh Farms', hens: 0.85 },
    { company: 'Chino Valley Ranchers/MCM Poultry', hens: 0.84 },
    { company: 'Wilcox Farms', hens: 0.83 },
    { company: 'Hillside Poultry Farms Inc.', hens: 0.68 },
    { company: 'Colorado Eggs', hens: 0.24 },
  ];

  // Calculate total hens for "Other" category (companies ranked 21st and below)
  const otherHensTotal = otherCompaniesData.reduce((sum, company) => sum + company.hens, 0);

  // Calculate total hens for ALL companies in the data (for percentage calculation)
  const totalHensAllCompanies = companyHensData.reduce((sum, company) => sum + company.hens, 0); // CALCULATED HERE - wider scope

  // Create final data array: Top 20 + "Other" category
  const companyHensData = [
    ...top20CompanyHensData, // Spread operator to include top 20
    { company: 'Other (Rank 21-61)', hens: otherHensTotal } // Add "Other" category
  ];

  // Sort data by hen count in ascending order for chart
  companyHensData.sort((a, b) => b.hens - a.hens);

  const companyNames = companyHensData.map(item => item.company);
  const henCounts = companyHensData.map(item => item.hens);

  const top20Color = 'rgba(100, 149, 237, 0.7)'; // Cornflower Blue
  const otherColor = 'rgba(220,220,220, 0.7)';   // Light gray for "Other"
  const backgroundColors = companyNames.map((name, index) => index < 20 ? top20Color : otherColor);

  new Chart(ctxMarketShare, {
    type: 'pie',
    data: {
      labels: companyNames,
      datasets: [{
        label: 'Hens (Millions)',
        data: henCounts,
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.dataset.data[context.dataIndex];
              // **Directly access totalHensAllCompanies - should be in scope now**
              const percentage = ((value / totalHensAllCompanies) * 100).toFixed(1);
              return label + ': ' + value + ' Million Hens (' + percentage + '%)';
            }
          }
        },
        legend: {
          display: false // Hidden legend
        },
        datalabels: { // Chart.js Datalabels Plugin Configuration - UPDATED LABELS POSITIONING
          color: 'black',
          font: {
            weight: 'bold',
            size: 11 // Slightly larger font size
          },
          formatter: (value, context) => {
            return context.chart.data.labels[context.dataIndex];
          },
          position: 'outside', // Position labels outside the pie
          textAlign: 'right',  // Align text to the right for outside labels
          offset: 10         // Adjust offset for labels
        },
        title: {
          display: 'none',
          text: 'US Egg Market Concentration (Top 20 Producers + Other)'
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

window.onload = () => {
  fetchFREDData();
  displayStorePrices();
  createMarketShareChart();
};