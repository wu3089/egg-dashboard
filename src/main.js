// main entry point for the dashboard

// import all the modules
import { initFredChart } from './fredChart.js';
import { initEggCart } from './eggCart.js';
import { initHenVisualization } from './henVisualization.js';
import { initEggFact } from './eggFact.js';
import { displayStorePrices } from './storePrices.js';
import { createMarketShareChart } from './marketShare.js';

// initialize everything when the window loads
window.addEventListener('DOMContentLoaded', () => {
  initFredChart();
  initEggCart();
  initHenVisualization();
  initEggFact();
  displayStorePrices();
  createMarketShareChart();
});