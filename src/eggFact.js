// Egg fact interaction

export function initEggFact() {
  // Find all egg-fact containers and add click listeners
  document.querySelectorAll('.egg-fact-container').forEach(container => {
    container.addEventListener('click', () => crackEgg(container));
  });
}

function crackEgg(container) {
  const eggEmoji = container.querySelector('.egg-emoji');
  const crackedEggEmoji = container.querySelector('.cracked-egg-emoji');
  const eggFact = container.querySelector('.egg-fact');

  // Animate the un-cracked egg
  eggEmoji.classList.add('egg-crack-animation');

  // After the animation finishes (~400ms), hide the un-cracked egg
  // and show the cracked egg + the fact text
  setTimeout(() => {
    eggEmoji.classList.add('hidden');
    crackedEggEmoji.classList.remove('hidden');
    eggFact.classList.remove('hidden');
  }, 400);
}