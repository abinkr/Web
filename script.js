const stage = document.getElementById('stage');
const landing = document.getElementById('landing');
const loveBtn = document.getElementById('loveBtn');
const controls = document.getElementById('controls');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const message = document.getElementById('message');
const valentineOverlay = document.getElementById('valentineOverlay');
const instruction = document.getElementById('instruction');

const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF92C2','#A66CFF','#FFB86B'];

let countingActive = false;
let noCount = 0;
let afterYes = false;
let showingInstruction = false;

// Track user interactions for developer
const userInteractions = [];

function trackInteraction(action, details) {
  const timestamp = new Date().toISOString();
  const interaction = { timestamp, action, details };
  userInteractions.push(interaction);
  localStorage.setItem('userInteractions', JSON.stringify(userInteractions));
  console.log('[Flower App Tracking]', interaction);
}

// Expose function for developers to view all interactions
window.getFlowerAppAnalytics = function() {
  const data = localStorage.getItem('userInteractions');
  const interactions = data ? JSON.parse(data) : [];
  console.table(interactions);
  console.log('Total interactions:', interactions.length);
  return interactions;
};

// Load previous interactions from localStorage on page load
window.addEventListener('load', () => {
  const stored = localStorage.getItem('userInteractions');
  if (stored) {
    const parsed = JSON.parse(stored);
    userInteractions.push(...parsed);
  }
  console.log('🌸 Flower Blooming App - Developer Mode Active');
  console.log('Use getFlowerAppAnalytics() to view all user interactions');
});

loveBtn.addEventListener('click', () => {
  trackInteraction('LOVE_BUTTON_CLICKED', { action: 'User clicked love button to enter' });
  landing.style.display = 'none';
  controls.setAttribute('aria-hidden', 'false');
  stage.setAttribute('aria-hidden', 'false');
  // Show Valentine message and background immediately
  stage.classList.add('valentine');
  valentineOverlay.classList.add('show');
  valentineOverlay.setAttribute('aria-hidden', 'false');
});

stage.addEventListener('pointerdown', (e) => {
  // If showing instruction, hide it on first click and enable flower creation
  if (showingInstruction) {
    trackInteraction('STAGE_CLICK_ON_INSTRUCTION', { action: 'User clicked to dismiss instruction' });
    instruction.style.display = 'none';
    showingInstruction = false;
    afterYes = true;
    return;
  }
  
  // Only create flowers after Yes is clicked
  if (afterYes) {
    createFlower(e.clientX, e.clientY);
    trackInteraction('FLOWER_CREATED', { action: 'User created a flower', x: e.clientX, y: e.clientY });
  }
  if (countingActive) {
    noCount++;
    trackInteraction('SCREEN_TAP_COUNTED', { action: 'Screen tap counted during No phase', currentCount: noCount });
  }
});

yesBtn.addEventListener('click', () => {
  trackInteraction('YES_BUTTON_CLICKED', { action: 'User clicked Yes button' });
  // Hide Valentine overlay and controls
  valentineOverlay.classList.remove('show');
  valentineOverlay.setAttribute('aria-hidden', 'true');
  controls.setAttribute('aria-hidden', 'true');
  
  // Show instruction text
  showingInstruction = true;
  instruction.style.display = 'block';
});

noBtn.addEventListener('click', () => {
  trackInteraction('NO_BUTTON_CLICKED', { action: 'User clicked No button', countingStarted: true });
  noBtn.style.display = 'none';
  countingActive = true;
  noCount = 0;
  // automatically send count after 10s
  setTimeout(() => {
    countingActive = false;
    trackInteraction('NO_COUNT_COLLECTED', { action: 'No button counting period ended', totalCount: noCount });
    sendCountHidden(noCount);
  }, 10000);
});

function createFlower(x, y) {
  const color = colors[Math.floor(Math.random() * colors.length)];
  // Responsive flower size based on viewport
  const baseSize = Math.min(window.innerHeight, window.innerWidth) / 8;
  const size = baseSize * (0.7 + Math.random() * 0.6);
  const svg = createFlowerSVG(size, color);

  const wrapper = document.createElement('div');
  wrapper.className = 'flower';
  wrapper.style.left = x + 'px';
  wrapper.style.top = y + 'px';
  wrapper.appendChild(svg);
  stage.appendChild(wrapper);

  requestAnimationFrame(() => {
    svg.classList.add('bloom');
  });

  setTimeout(() => {
    wrapper.classList.add('fade');
    setTimeout(() => wrapper.remove(), 500);
  }, 1600);
}

function createFlowerSVG(size, color) {
  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttribute('viewBox', '-50 -50 100 100');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.classList.add('bloomTarget', 'bloom-shadow');

  const petals = 8;
  for (let i = 0; i < petals; i++) {
    const pet = document.createElementNS(xmlns, 'ellipse');
    pet.setAttribute('cx', 0);
    pet.setAttribute('cy', -22);
    pet.setAttribute('rx', 10);
    pet.setAttribute('ry', 24);
    const angle = i * (360 / petals);
    pet.setAttribute('transform', `rotate(${angle})`);
    pet.setAttribute('fill', color);
    svg.appendChild(pet);
  }

  const center = document.createElementNS(xmlns, 'circle');
  center.setAttribute('cx', 0);
  center.setAttribute('cy', 0);
  center.setAttribute('r', 10);
  center.setAttribute('fill', shadeColor(color, -20));
  svg.appendChild(center);

  return svg;
}

function showMessage(text) {
  message.textContent = text;
  message.style.display = 'block';
  setTimeout(() => (message.style.display = 'none'), 3500);
}

// send count to server endpoint - hidden from user
function sendCountHidden(count) {
  const payload = { email: 'akr2647@gmail.com', count };
  // Best-effort: POST to /send-count (server required). This is silent to the user.
  fetch('/send-count', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // fallback: try to send using a configured email service (left as integration)
    console.log('send-count failed (no server). Provide a backend or EmailJS integration to actually send mail.');
  });
}

// simple hex shade adjust: percent negative to darken
function shadeColor(hex, percent) {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}
