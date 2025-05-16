const avatars = [
  'avatars/Dino 2.png',
  'avatars/Dino 3.png',
  'avatars/Dino 4.png',
  'avatars/Dino 5.png'
];

let players = [
  { name: '', avatar: '', poisonCandy: null, eatenCandies: [] },
  { name: '', avatar: '', poisonCandy: null, eatenCandies: [] }
];

let candies = [];
let candyCount = 21;
let currentPlayer = 0;
let gameStarted = false;
let gameOver = false;
let wins = [0, 0];

// DOM Elements
const playerSetupDivs = document.querySelectorAll('.player-setup');
const nameInputs = [document.getElementById('player1-name'), document.getElementById('player2-name')];
const avatarContainers = document.querySelectorAll('.avatar-options');
const candyGrid = document.getElementById('candy-grid');
const candyGridPlay = document.getElementById('candy-grid-play');
const turnIndicator = document.getElementById('turn-indicator');
const resultMessage = document.getElementById('result-message');
const winTable = document.getElementById('win-table');
const restartBtn = document.getElementById('restart-btn');

// Initialize avatar options in UI
avatarContainers.forEach((container, playerIndex) => {
  avatars.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Avatar ${i + 1}`;
    img.addEventListener('click', () => {
      selectAvatar(playerIndex, src, img);
    });
    container.appendChild(img);
  });
});

// Avatar selection logic
function selectAvatar(playerIndex, src, imgElement) {
  // Remove selected from other avatars for this player
  avatarContainers[playerIndex].querySelectorAll('img').forEach(img => {
    img.classList.remove('selected');
  });
  // Mark this avatar as selected
  imgElement.classList.add('selected');
  players[playerIndex].avatar = src;
}

// Setup button
document.getElementById('setup-btn').addEventListener('click', () => {
  if (
    !nameInputs[0].value.trim() ||
    !nameInputs[1].value.trim() ||
    !players[0].avatar ||
    !players[1].avatar
  ) {
    alert('Please enter names and select avatars for both players.');
    return;
  }
  players[0].name = nameInputs[0].value.trim();
  players[1].name = nameInputs[1].value.trim();

  startPoisonCandyChoice();
});

function startPoisonCandyChoice() {
  // Hide player setup divs and show poison candy selection
  playerSetupDivs.forEach(div => div.classList.add('hidden'));
  candyGrid.classList.remove('hidden');
  candyGridPlay.classList.add('hidden');
  turnIndicator.textContent = `${players[0].name}, select your poison candy`;
  resultMessage.textContent = '';
  gameStarted = false;
  gameOver = false;
  currentPlayer = 0;
  candies = [];

  // Create candies for selection
  candyGrid.innerHTML = '';
  for (let i = 1; i <= candyCount; i++) {
    const candy = document.createElement('div');
    candy.classList.add('candy');
    candy.style.backgroundColor = getCandyColor(i);
    candy.dataset.id = i;
    candy.addEventListener('click', poisonCandySelect);
    candyGrid.appendChild(candy);
    candies.push(candy);
  }
}

function getCandyColor(i) {
  // 21 candy colors - you can customize colors here:
  const colors = [
    '#FF6347', '#FFD700', '#40E0D0', '#FF69B4', '#8A2BE2',
    '#7FFF00', '#FF4500', '#00FFFF', '#FF1493', '#1E90FF',
    '#FF8C00', '#00FF7F', '#FF00FF', '#ADFF2F', '#DC143C',
    '#00CED1', '#FFB6C1', '#7B68EE', '#FFA500', '#48D1CC', '#C71585'
  ];
  return colors[(i - 1) % colors.length];
}

function poisonCandySelect(e) {
  if (gameOver) return;
  const candyId = Number(e.target.dataset.id);

  // Set poison candy for current player
  players[currentPlayer].poisonCandy = candyId;

  // Visually mark chosen poison candy
  e.target.style.border = '3px solid red';

  currentPlayer++;

  if (currentPlayer === 2) {
    // Both players chosen poison candy
    startGamePlay();
  } else {
    turnIndicator.textContent = `${players[currentPlayer].name}, select your poison candy`;
  }
}

function startGamePlay() {
  gameStarted = true;
  currentPlayer = 0;
  candyGrid.classList.add('hidden');
  candyGridPlay.classList.remove('hidden');
  resultMessage.textContent = '';
  turnIndicator.textContent = `${players[currentPlayer].name}'s turn to eat a candy`;

  // Setup candies for gameplay (all uneaten)
  candyGridPlay.innerHTML = '';
  candies.forEach(c => {
    c.classList.remove('eaten');
    c.style.border = '';
    candyGridPlay.appendChild(c);
  });

  candies.forEach(c => {
    c.addEventListener('click', candyEat);
  });
}

function candyEat(e) {
  if (gameOver || !gameStarted) return;

  const candyId = Number(e.target.dataset.id);
  const eater = players[currentPlayer];
  const opponent = players[1 - currentPlayer];

  // Check if candy is already eaten
  if (e.target.classList.contains('eaten')) return;

  // Eat candy visually
  e.target.classList.add('eaten');
  eater.eatenCandies.push(candyId);

  // Check poison candy condition
  if (candyId === opponent.poisonCandy) {
    // Opponent's poison candy eaten -> game over
    gameOver = true;
    resultMessage.textContent = 'Poison';
    resultMessage.style.color = 'darkred';
    turnIndicator.textContent = `${eater.name} wins!`;
    wins[currentPlayer]++;
    updateWinTable();
    restartBtn.classList.remove('hidden');
    return;
  }

  // Safe candy eaten
  currentPlayer = 1 - currentPlayer;
  turnIndicator.textContent = `${players[currentPlayer].name}'s turn to eat a candy`;
}

restartBtn.addEventListener('click', () => {
  resetGame();
});

function updateWinTable() {
  winTable.innerHTML = `
    <h3>Win Table</h3>
    <p>${players[0].name}: ${wins[0]}</p>
    <p>${players[1].name}: ${wins[1]}</p>
  `;
}

function resetGame() {
  // Reset everything to start setup again
  gameStarted = false;
  gameOver = false;
  currentPlayer = 0;
  players.forEach(p => {
    p.poisonCandy = null;
    p.eatenCandies = [];
  });
  restartBtn.classList.add('hidden');
  playerSetupDivs.forEach(div => div.classList.remove('hidden'));
  candyGrid.classList.add('hidden');
  candyGridPlay.classList.add('hidden');
  resultMessage.textContent = '';
  turnIndicator.textContent = '';
  candies.forEach(c => {
    c.classList.remove('eaten');
    c.style.border = '';
  });

  // Clear avatar selections
  avatarContainers.forEach(container => {
    container.querySelectorAll('img').forEach(img => {
      img.classList.remove('selected');
    });
  });
  nameInputs.forEach(input => (input.value = ''));
}

