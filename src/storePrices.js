// Store price display

// Store prices data
const storePrices = {
  walmart: 5.47,  // Example prices - UPDATE THESE to current prices!
  kroger: 5.69,   // You'll need to check actual prices at these stores
  target: 5.49,
};

// Calculate average store price
export const averageStorePrice = Object.values(storePrices).reduce(
  (sum, price) => sum + price, 0
) / Object.values(storePrices).length;

export function displayStorePrices() {
  const walmartPriceEl = document.getElementById('walmart-price');
  const krogerPriceEl = document.getElementById('kroger-price');
  const targetPriceEl = document.getElementById('target-price');

  if (walmartPriceEl && krogerPriceEl && targetPriceEl) {
    walmartPriceEl.textContent = `$${storePrices.walmart.toFixed(2)}/dozen`;
    krogerPriceEl.textContent = `$${storePrices.kroger.toFixed(2)}/dozen`;
    targetPriceEl.textContent = `$${storePrices.target.toFixed(2)}/dozen`;
  }
}