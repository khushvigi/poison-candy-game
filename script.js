// Candy data: 21 colors
const candyColors = [
  '#ff4d4d', '#ff944d', '#ffdb4d', '#d2ff4d', '#4dff4d', '#4dffc3',
  '#4dd2ff', '#4d4dff', '#944dff', '#ff4dff', '#ff4dbf', '#ff4d7f',
  '#ff704d', '#ffaf4d', '#ffe24d', '#bfff4d', '#4dff7f', '#4dffaf',
  '#4dffe2', '#4dbfff', '#4d7fff'
];

let players = [
  { name: '', avatar: '', poisonCandy: null, wins: 0 },
  { name: '', avatar: '', poisonCandy: null, wins: 0 },
];

let turn = 0; // 0 or 1 for player index
let candiesEaten = [];
let gameActive = false;

const playerSetup = document.getElementById('player-setup');
const gameArea = document.getElementById('game-area');
const candyGrid = document.getElementById('candy-grid');
const turnIndicator = document.getElementById('turn-indicator');
const resultMessage = document.getElementById('result-message');
const restartBtn = document.getElementById('restart-btn');
const winTable = document.getElementById('win-table');

const soundSafe = document.getElementById('sound-safe');
const soundPoison = document.getElementById('sound-poison');
const soundWin = document.getElementById('sound-win');

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function updateWinTable() {
  winTable.innerHTML = `
    <p>${players[0].name || 'Player 1'} Wins: ${players[0].wins}</p>
    <p>${players[1].name || 'Player 2'} Wins: ${players[1].wins}</p>
  `;
}

function selectAvatarHandler(event) {
  if (event.target.tagName !== 'IMG') return;
  const playerNum = event.target.dataset.player;
  const container = playerNum === '1' ? document.getElementById('player1-avatars') : document.getElementById('player2-avatars');
  Array.from(container.children).forEach(img => img.classList.remove('selected'));
  event.target.classList.add('selected');
  players[playerNum - 1].avatar = event.target.src;
}

function setupAvatars() {
  document.getElementById('player1-avatars').addEventListener('click', selectAvatarHandler);
  document.getElementById('player2-avatars').addEventListener('click', selectAvatarHandler);
}

function startGame() {
  // get names
  const p1name = document.getElementById('player1-name').value.trim();
  const p2name = document.getElementById('player2-name').value.trim();
  if (!p1name || !p2name) {
    alert('Please enter names for both players!');
    return;
  }
  if (!players[0].avatar || !players[1].avatar) {
    alert('Please select avatars for both players!');
    return;
  }
  players[0].name = p1name;
  players[1].name = p2name;

  // Reset poison candy and candies eaten
  players[0].poisonCandy = null;
  players[1].poisonCandy = null;
  candiesEaten = [];
  gameActive = true;
  turn = 0;
  resultMessage.textContent = '';

  // Hide setup, show game
  playerSetup.classList.add('hidden');
  gameArea.classList.remove('hidden');

  setupCandySelection();
  updateTurnIndicator();

  updateWinTable();
}

function setupCandySelection() {
  candyGrid.innerHTML = '';
  candyGrid.style.gridTemplateColumns = 'repeat(7, 60px)';

  // Create candy elements for poison candy selection phase (21 candies)
  candyColors.forEach((color, index) => {
    const candy = document.createElement('div');
    candy.classList.add('candy');
    candy.style.backgroundColor = color;
    candy.dataset.index = index;
    candy.dataset.phase = 'poison-select';
    candy.title = `Candy #${index + 1}`;
    candy.addEventListener('click', selectPoisonCandy);
    candyGrid.appendChild(candy);
  });
}

function selectPoisonCandy(e) {
  if (!gameActive) return;
  const idx = Number(e.target.dataset.index);
  const currentPlayer = players[turn];

  if (currentPlayer.poisonCandy !== null) {
    alert('You already chose your poison candy!');
    return;
  }

  currentPlayer.poisonCandy = idx;
  e.target.classList.add('selected');
  e.target.style.border = `3px solid ${turn === 0 ? '#d63384' : '#3333ff'}`;
  e.target.removeEventListener('click', selectPoisonCandy);

  // Switch turn to next player or start candy eating phase if both chosen
  if (players[0].poisonCandy !== null && players[1].poisonCandy !== null) {
    startCandyEatingPhase();
  } else {
    turn = 1 - turn;
    updateTurnIndicator();
  }
}

function startCandyEatingPhase() {
  candiesEaten = [];
  candyGrid.innerHTML = '';
  candyGrid.style.gridTemplateColumns = 'repeat(7, 60px)';

  candyColors.forEach((color, index) => {
    const candy = document.createElement('div');
    candy.classList.add('candy');
    candy.style.backgroundColor = color;
    candy.dataset.index = index;
    candy.dataset.phase = 'eat';
    candy.title = `Candy #${index + 1}`;
    candy.addEventListener('click', candyEatHandler);
    candyGrid.appendChild(candy);
  });

  turn = 0;
  updateTurnIndicator();
}

function candyEatHandler(e) {
  if (!gameActive) return;
  const candy = e.target;
  const idx = Number(candy.dataset.index);
  const currentPlayer = players[turn];

  if (candiesEaten.includes(idx)) {
    alert('Candy already eaten!');
    return;
  }

  candiesEaten.push(idx);
  candy.classList.add('eaten');
  candy.removeEventListener('click', candyEatHandler);

  // Check if poison candy eaten by other player
  const otherPlayer = players[1 - turn];
  if (idx === otherPlayer.poisonCandy) {
    // Poison eaten - other player wins
    resultMessage.textContent = 'Poison';
    resultMessage.style.color = 'red';
    playSound(soundPoison);
    otherPlayer.wins++;
    updateWinTable();
    gameActive = false;
    restartBtn.classList.remove('hidden');
    return;
  }

  // Safe candy eaten
  playSound(soundSafe);

  // Switch turn
  turn = 1 - turn;
  updateTurnIndicator();
}

function updateTurnIndicator() {
  if (!gameActive) {
    turnIndicator.textContent = '';
    return;
  }
  turnIndicator.textContent = `${players[turn].name}'s Turn`;
}

function restartGame() {
  playerSetup.classList.remove('hidden');
  gameArea.classList.add('hidden');
  restartBtn.classList.add('hidden');
  resultMessage.textContent = '';
  // Reset all game data
  players[0].poisonCandy = null;
  players[1].poisonCandy = null;
  candiesEaten = [];
  gameActive = false;
  turn = 0;

  // Reset avatars selection UI
  document.querySelectorAll('.avatar-options img').forEach(img => img.classList.remove('selected'));
  document.getElementById('player1-name').value = '';
  document.getElementById('player2-name').value = '';
}

document.getElementById('start-game-btn').addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
setupAvatars();
updateWinTable();
