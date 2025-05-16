// script.js

let poisonSelectionPhase = true; // true when players are picking poison candies
let currentPoisonPicker = 1;     // 1 means Player 1 chooses, 2 means Player 2 chooses
let poisonCandies = {1: null, 2: null}; // store poison candies chosen by players

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
const candyCount = 21;

let currentPlayerIndex = 0; // 0 or 1

// Initialize candies
function createCandies() {
  candies = [];
  for (let i = 1; i <= candyCount; i++) {
    candies.push({ id: i.toString(), eaten: false });
  }
}

// Render candies on the grid
function renderCandies() {
  const candyGrid = document.getElementById('candy-grid');
  candyGrid.innerHTML = '';
  candies.forEach(candy => {
    const candyDiv = document.createElement('div');
    candyDiv.classList.add('candy');
    candyDiv.dataset.id = candy.id;
    candyDiv.textContent = candy.id;
    if (candy.eaten) {
      candyDiv.classList.add('eaten');
      candyDiv.style.pointerEvents = 'none';
      candyDiv.style.opacity = '0.4';
    }
    candyGrid.appendChild(candyDiv);
  });

  // Attach event listeners after rendering
  const candyElements = document.querySelectorAll('.candy');
  candyElements.forEach(candy => {
    candy.addEventListener('click', onCandyClick);
  });
}

// Update turn indicator text
function updateTurnIndicator(text) {
  const turnIndicator = document.getElementById('turn-indicator');
  turnIndicator.textContent = text;
}

// Show result message
function showResult(message) {
  const resultMessage = document.getElementById('result-message');
  resultMessage.textContent = message;
}

// Reset game state and UI
function resetGame() {
  poisonSelectionPhase = true;
  currentPoisonPicker = 1;
  poisonCandies = {1: null, 2: null};
  players = [
    { name: '', avatar: '', poisonCandy: null, eatenCandies: [] },
    { name: '', avatar: '', poisonCandy: null, eatenCandies: [] }
  ];
  currentPlayerIndex = 0;
  createCandies();
  renderCandies();
  updateTurnIndicator('Player 1, pick your poison candy');
  showResult('');
  // Clear inputs and avatar selections if any (implement as needed)
  localStorage.clear();
}

// Handle candy clicks
function onCandyClick(event) {
  const candyId = event.target.dataset.id;

  if (poisonSelectionPhase) {
    // Selecting poison candies
    if (poisonCandies[currentPoisonPicker] === candyId) {
      alert("You already selected this candy! Pick another one.");
      return;
    }
    poisonCandies[currentPoisonPicker] = candyId;
    alert(`Player ${currentPoisonPicker} picked poison candy #${candyId}`);

    if (currentPoisonPicker === 1) {
      currentPoisonPicker = 2;
      updateTurnIndicator('Player 2, pick your poison candy');
    } else {
      // Both poison candies selected
      poisonSelectionPhase = false;
      players[0].poisonCandy = poisonCandies[1];
      players[1].poisonCandy = poisonCandies[2];
      updateTurnIndicator("Player 1's turn to eat a candy");
      saveGameState();
    }
  } else {
    // Normal candy eating phase
    if (candies.find(c => c.id === candyId).eaten) {
      alert('This candy is already eaten!');
      return;
    }

    // Mark candy eaten
    candies.forEach(c => {
      if (c.id === candyId) c.eaten = true;
    });
    renderCandies();

    // Add candy to current player's eaten candies
    players[currentPlayerIndex].eatenCandies.push(candyId);

    // Check if player ate opponent's poison candy - game over
    const opponentIndex = (currentPlayerIndex === 0) ? 1 : 0;
    if (candyId === players[opponentIndex].poisonCandy) {
      showResult(`Player ${currentPlayerIndex + 1} ate opponent's poison candy! Player ${opponentIndex + 1} wins!`);
      updateTurnIndicator('Game Over');
      localStorage.clear();
      return;
    }

    // Check if all candies are eaten - draw or game end
    const uneatenCandies = candies.filter(c => !c.eaten);
    if (uneatenCandies.length === 0) {
      showResult("All candies eaten! It's a draw!");
      updateTurnIndicator('Game Over');
      localStorage.clear();
      return;
    }

    // Switch turns
    currentPlayerIndex = opponentIndex;
    updateTurnIndicator(`Player ${currentPlayerIndex + 1}'s turn to eat a candy`);
    saveGameState();
  }
}

// Save game state to localStorage
function saveGameState() {
  const state = {
    poisonSelectionPhase,
    currentPoisonPicker,
    poisonCandies,
    players,
    candies,
    currentPlayerIndex
  };
  localStorage.setItem('poisonCandyGameState', JSON.stringify(state));
}

// Load game state from localStorage
function loadGameState() {
  const savedState = localStorage.getItem('poisonCandyGameState');
  if (savedState) {
    const state = JSON.parse(savedState);
    poisonSelectionPhase = state.poisonSelectionPhase;
    currentPoisonPicker = state.currentPoisonPicker;
    poisonCandies = state.poisonCandies;
    players = state.players;
    candies = state.candies;
    currentPlayerIndex = state.currentPlayerIndex;
    renderCandies();

    if (poisonSelectionPhase) {
      updateTurnIndicator(`Player ${currentPoisonPicker}, pick your poison candy`);
    } else {
      updateTurnIndicator(`Player ${currentPlayerIndex + 1}'s turn to eat a candy`);
    }
  } else {
    resetGame();
  }
}

// Initialize
window.onload = function () {
  loadGameState();
};

// You can add other helper functions for avatar selection, player names etc as needed.
