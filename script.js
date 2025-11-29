const difficulties = {
  easy: { label: "쉬움 4×3", rows: 3, cols: 4 },
  medium: { label: "보통 4×4", rows: 4, cols: 4 },
  hard: { label: "어려움 6×6", rows: 6, cols: 6 },
};

const icons = [
  "🐶",
  "🐱",
  "🦊",
  "🦁",
  "🐸",
  "🐼",
  "🐵",
  "🐨",
  "🐰",
  "🦄",
  "🐙",
  "🦕",
  "🦋",
  "🌸",
  "🍀",
  "🍉",
  "🍓",
  "🍒",
  "⚽",
  "🎲",
];

const boardEl = document.getElementById("board");
const difficultySelect = document.getElementById("difficulty");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const bestRecordEl = document.getElementById("bestRecord");
const modalEl = document.getElementById("resultModal");
const modalSummaryEl = document.getElementById("modalSummary");
const modalRestartBtn = document.getElementById("modalRestart");
const modalCloseBtn = document.getElementById("modalClose");

let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matches = 0;
let totalPairs = 0;
let timer = 0;
let timerInterval = null;
let hintUsed = false;
let bestRecords = {};

function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function loadBestRecords() {
  try {
    const stored = localStorage.getItem("memory-best-records");
    bestRecords = stored ? JSON.parse(stored) : {};
  } catch (_) {
    bestRecords = {};
  }
}

function saveBestRecords() {
  localStorage.setItem("memory-best-records", JSON.stringify(bestRecords));
}

function updateBestDisplay(difficultyKey) {
  const record = bestRecords[difficultyKey];
  if (record) {
    bestRecordEl.textContent = `${formatTime(record.time)} / ${record.moves}회`;
  } else {
    bestRecordEl.textContent = "-";
  }
}

function startTimer() {
  stopTimer();
  timer = 0;
  timerEl.textContent = formatTime(timer);
  timerInterval = setInterval(() => {
    timer += 1;
    timerEl.textContent = formatTime(timer);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetBoardLayout(rows, cols) {
  boardEl.style.gridTemplateColumns = `repeat(${cols}, minmax(60px, 1fr))`;
  boardEl.style.gridTemplateRows = `repeat(${rows}, auto)`;
}

function createCard(symbol, index) {
  const card = document.createElement("button");
  card.className = "card";
  card.dataset.symbol = symbol;
  card.dataset.index = index;
  card.setAttribute("aria-pressed", "false");
  card.innerHTML = `
    <span class="card-inner">
      <span class="card-face card-front" aria-hidden="true">${symbol}</span>
      <span class="card-face card-back" aria-hidden="true">★</span>
    </span>
  `;
  card.addEventListener("click", () => handleCardClick(card));
  return card;
}

function prepareCards(difficultyKey) {
  const { rows, cols } = difficulties[difficultyKey];
  const neededPairs = (rows * cols) / 2;
  const chosenIcons = shuffle(icons).slice(0, neededPairs);
  const duplicated = shuffle([...chosenIcons, ...chosenIcons]);
  totalPairs = neededPairs;
  resetBoardLayout(rows, cols);
  boardEl.innerHTML = "";
  duplicated.forEach((symbol, index) => {
    const card = createCard(symbol, index);
    boardEl.appendChild(card);
  });
}

function resetStats(difficultyKey) {
  moves = 0;
  matches = 0;
  flippedCards = [];
  lockBoard = false;
  hintUsed = false;
  movesEl.textContent = moves;
  matchesEl.textContent = matches;
  hintBtn.disabled = false;
  boardEl.classList.remove("showing-hint");
  updateBestDisplay(difficultyKey);
}

function showModal(summaryText) {
  modalSummaryEl.textContent = summaryText;
  modalEl.classList.add("visible");
  modalEl.setAttribute("aria-hidden", "false");
}

function hideModal() {
  modalEl.classList.remove("visible");
  modalEl.setAttribute("aria-hidden", "true");
}

function checkWin(difficultyKey) {
  if (matches === totalPairs) {
    stopTimer();
    const record = bestRecords[difficultyKey];
    if (!record || timer < record.time || (timer === record.time && moves < record.moves)) {
      bestRecords[difficultyKey] = { time: timer, moves };
      saveBestRecords();
      updateBestDisplay(difficultyKey);
    }
    showModal(`시간 ${formatTime(timer)}, 시도 ${moves}회로 모든 카드를 맞췄어요!`);
  }
}

function unflipCards() {
  setTimeout(() => {
    flippedCards.forEach((card) => {
      card.classList.remove("flipped");
      card.setAttribute("aria-pressed", "false");
    });
    flippedCards = [];
    lockBoard = false;
  }, 800);
}

function handleMatchSuccess() {
  flippedCards.forEach((card) => {
    card.classList.add("matched");
  });
  flippedCards = [];
  lockBoard = false;
}

function handleCardClick(card) {
  if (lockBoard || flippedCards.includes(card) || card.classList.contains("matched")) {
    return;
  }

  card.classList.add("flipped");
  card.setAttribute("aria-pressed", "true");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    lockBoard = true;
    moves += 1;
    movesEl.textContent = moves;

    const [first, second] = flippedCards;
    if (first.dataset.symbol === second.dataset.symbol) {
      matches += 1;
      matchesEl.textContent = matches;
      handleMatchSuccess();
      checkWin(difficultySelect.value);
    } else {
      unflipCards();
    }
  }
}

function triggerHint() {
  if (hintUsed) return;
  hintUsed = true;
  hintBtn.disabled = true;
  boardEl.classList.add("showing-hint");
  setTimeout(() => {
    boardEl.classList.remove("showing-hint");
  }, 2000);
}

function startGame() {
  const difficultyKey = difficultySelect.value;
  resetStats(difficultyKey);
  prepareCards(difficultyKey);
  startTimer();
  hideModal();
}

restartBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", startGame);
hintBtn.addEventListener("click", triggerHint);
modalRestartBtn.addEventListener("click", () => {
  hideModal();
  startGame();
});
modalCloseBtn.addEventListener("click", hideModal);
modalEl.addEventListener("click", (event) => {
  if (event.target === modalEl) {
    hideModal();
  }
});

loadBestRecords();
startGame();
