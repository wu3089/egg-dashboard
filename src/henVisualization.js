// Hen visualization functionality

// Constants
const top10Percent = 54.1; // 54.1% of hens are owned by top 10 producers
const top20Percent = 75.2; // 75.2% of hens are owned by top 20 producers

export function initHenVisualization() {
  // Create the visualization
  createHenVisualization();
  
  // Add event listeners to buttons
  document.getElementById('showTop10Btn')?.addEventListener('click', () => {
    updateHenColors('top10');
  });

  document.getElementById('showTop20Btn')?.addEventListener('click', () => {
    updateHenColors('top20');
  });
}

function createHenVisualization() {
  const container = document.querySelector('.hen-visualization');
  if (!container) return;

  // Clear any existing content
  container.innerHTML = '';

  // Create 100 hen emojis
  for (let i = 1; i <= 100; i++) {
    const henSpan = document.createElement('span');
    henSpan.textContent = '🐔';

    // Default: all are "other"
    henSpan.classList.add('other');
    henSpan.title = 'Other Producers';

    container.appendChild(henSpan);
  }
}

function updateHenColors(mode) {
  const container = document.querySelector('.hen-visualization');
  if (!container) return;

  // Grab all the span elements (the 100 hens)
  const henSpans = container.querySelectorAll('span');

  henSpans.forEach((henSpan, index) => {
    // index starts at 0, so add 1 to compare with top10Percent, top20Percent
    const position = index + 1; 
    // Reset classes
    henSpan.classList.remove('top10', 'top20', 'other');

    if (mode === 'top10') {
      // If in top 10 range => gold
      if (position <= top10Percent) {
        henSpan.classList.add('top10');
        henSpan.title = 'Top 10 Producers';
      } else {
        henSpan.classList.add('other');
        henSpan.title = 'Other Producers';
      }
    } else if (mode === 'top20') {
      // top10 => gold, next 10 => cornflowerblue, rest => other
      if (position <= top10Percent) {
        henSpan.classList.add('top10');
        henSpan.title = 'Top 10 Producers';
      } else if (position <= top20Percent) {
        henSpan.classList.add('top20');
        henSpan.title = 'Top 20 Producers';
      } else {
        henSpan.classList.add('other');
        henSpan.title = 'Other Producers';
      }
    }
  });
}