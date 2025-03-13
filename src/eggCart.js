// Shopping cart functionality

// Constants and variables
const PRICE_PER_EGG = 0.498;
let eggCount = 0;

// DOM elements
let addEggBtn;
let removeEggBtn;
let eggCountEl;
let flyingEggEl;
let cartIconImage;
let moneyTickerEl;
let productBoxEl;

export function initEggCart() {
  // Get DOM elements
  addEggBtn = document.getElementById('add-egg-btn');
  removeEggBtn = document.getElementById('remove-egg-btn');
  eggCountEl = document.getElementById('egg-count');
  flyingEggEl = document.getElementById('flying-egg');
  cartIconImage = document.getElementById('cart-icon-image');
  moneyTickerEl = document.getElementById('money-ticker');
  productBoxEl = document.getElementById('product-box');

  // Set up event listeners
  if (addEggBtn && removeEggBtn && eggCountEl && flyingEggEl && cartIconImage && moneyTickerEl && productBoxEl) {
    addEggBtn.addEventListener('click', addEgg);
    removeEggBtn.addEventListener('click', removeEgg);
  }
}

function addEgg() {
  eggCount++;
  eggCountEl.textContent = eggCount;
  updateMoneyTicker();
  eggCountEl.classList.add('egg-bounce');
  setTimeout(() => {
    eggCountEl.classList.remove('egg-bounce');
  }, 400);
  animateFlyingEgg();
}

function removeEgg() {
  if (eggCount > 0) {
    eggCount--;
    eggCountEl.textContent = eggCount;
    updateMoneyTicker();
    eggCountEl.classList.add('egg-bounce');
    setTimeout(() => {
      eggCountEl.classList.remove('egg-bounce');
    }, 400);
    animateRemovingEgg();
  }
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

function animateRemovingEgg() {
  const btnRect = removeEggBtn.getBoundingClientRect();
  const cartRect = cartIconImage.getBoundingClientRect();
  const productBoxRect = productBoxEl.getBoundingClientRect();
  
  const startX = cartRect.left + (cartRect.width / 2) - productBoxRect.left;
  const startY = cartRect.top + (cartRect.height / 2) - productBoxRect.top;
  const endX = btnRect.left + (btnRect.width / 2) - productBoxRect.left;
  const endY = btnRect.top + (btnRect.height / 2) - productBoxRect.top;
  
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
      disappearEgg();
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

function disappearEgg() {
  flyingEggEl.style.animation = 'disappearEgg 0.4s forwards';
  setTimeout(() => {
    flyingEggEl.style.display = 'none';
    flyingEggEl.style.animation = '';
  }, 400);
}