const cells = document.querySelectorAll(".cell");
const levelButtons = document.querySelectorAll(".level");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");

const playerScoreText = document.getElementById("playerScore");
const computerScoreText = document.getElementById("computerScore");
const drawScoreText = document.getElementById("drawScore");

let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;
let computerThinking = false;
let level = 1;

let playerScore = 0;
let computerScore = 0;
let drawScore = 0;

const HUMAN = "X";
const AI = "O";

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

levelButtons.forEach(button => {
  button.addEventListener("click", () => {
    level = Number(button.dataset.level);

    levelButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    restartGame();
  });
});

cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const index = Number(cell.dataset.index);

    if (
      gameOver ||
      computerThinking ||
      board[index] !== ""
    ) {
      return;
    }

    makeMove(index, HUMAN);

    if (checkGame()) return;

    computerThinking = true;
    statusText.textContent = "🤖 الكمبيوتر بيفكر...";

    setTimeout(() => {
      computerMove();

      computerThinking = false;

      if (!gameOver) {
        statusText.textContent = "❌ دورك";
      }
    }, 450);
  });
});

restartButton.addEventListener("click", restartGame);

function makeMove(index, player) {
  board[index] = player;

  const cell = cells[index];

  cell.textContent = player === HUMAN ? "❌" : "⭕";

  cell.classList.add(
    player === HUMAN ? "x" : "o",
    "pop"
  );

  setTimeout(() => {
    cell.classList.remove("pop");
  }, 300);
}

function checkWinner(currentBoard = board) {
  for (const line of winningLines) {
    const [a, b, c] = line;

    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return {
        winner: currentBoard[a],
        line
      };
    }
  }

  if (currentBoard.every(cell => cell !== "")) {
    return {
      winner: "draw",
      line: []
    };
  }

  return null;
}

function checkGame() {
  const result = checkWinner();

  if (!result) {
    return false;
  }

  gameOver = true;

  if (result.winner === HUMAN) {
    playerScore++;
    playerScoreText.textContent = playerScore;

    statusText.textContent = "🎉 كسبت! أحسنت يا بطل!";

    highlightWinner(result.line);
    createConfetti();

  } else if (result.winner === AI) {
    computerScore++;
    computerScoreText.textContent = computerScore;

    statusText.textContent = "🤖 الكمبيوتر كسب!";
    highlightWinner(result.line);

  } else {
    drawScore++;
    drawScoreText.textContent = drawScore;

    statusText.textContent = "🤝 تعادل!";
  }

  return true;
}

function highlightWinner(line) {
  line.forEach(index => {
    cells[index].classList.add("win");
  });
}

function computerMove() {
  if (gameOver) return;

  let move;

  if (level === 1) {
    move = easyMove();
  }

  if (level === 2) {
    move = mediumMove();
  }

  if (level === 3) {
    move = hardMove();
  }

  if (level === 4) {
    move = legendaryMove();
  }

  if (move !== null && move !== undefined) {
    makeMove(move, AI);
    checkGame();
  }
}

function getEmptyCells() {
  return board
    .map((value, index) => value === "" ? index : null)
    .filter(index => index !== null);
}

/* 🟢 سهل */
function easyMove() {
  const empty = getEmptyCells();

  if (empty.length === 0) return null;

  return empty[
    Math.floor(Math.random() * empty.length)
  ];
}

/* 🔵 متوسط */
function mediumMove() {
  const empty = getEmptyCells();

  // الكمبيوتر يكسب لو يقدر
  for (const index of empty) {
    board[index] = AI;

    if (checkWinner(board)?.winner === AI) {
      board[index] = "";
      return index;
    }

    board[index] = "";
  }

  // يمنع اللاعب من الفوز
  for (const index of empty) {
    board[index] = HUMAN;

    if (checkWinner(board)?.winner === HUMAN) {
      board[index] = "";
      return index;
    }

    board[index] = "";
  }

  // المركز
  if (board[4] === "") {
    return 4;
  }

  // حركة عشوائية
  return empty[
    Math.floor(Math.random() * empty.length)
  ];
}

/* 🟠 صعب */
function hardMove() {
  const empty = getEmptyCells();

  // فرصة للفوز
  for (const index of empty) {
    board[index] = AI;

    if (checkWinner(board)?.winner === AI) {
      board[index] = "";
      return index;
    }

    board[index] = "";
  }

  // منع اللاعب
  for (const index of empty) {
    board[index] = HUMAN;

    if (checkWinner(board)?.winner === HUMAN) {
      board[index] = "";
      return index;
    }

    board[index] = "";
  }

  // في الصعب نستخدم أفضل حركة
  const result = minimax(board, AI);

  return result.index;
}

/* 🔴 أسطوري */
function legendaryMove() {
  const result = minimax(board, AI);

  return result.index;
}

/* 🧠 ذكاء الكمبيوتر */
function minimax(currentBoard, player) {
  const result = checkWinner(currentBoard);

  if (result) {
    if (result.winner === AI) {
      return {
        score: 10
      };
    }

    if (result.winner === HUMAN) {
      return {
        score: -10
      };
    }

    return {
      score: 0
    };
  }

  const empty = currentBoard
    .map((value, index) => value === "" ? index : null)
    .filter(index => index !== null);

  const moves = [];

  for (const index of empty) {
    const move = {
      index,
      score: 0
    };

    currentBoard[index] = player;

    const resultMove = minimax(
      currentBoard,
      player === AI ? HUMAN : AI
    );

    move.score = resultMove.score;

    currentBoard[index] = "";

    moves.push(move);
  }

  let bestMove;

  if (player === AI) {
    let bestScore = -Infinity;

    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;

    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

function restartGame() {
  board = ["", "", "", "", "", "", "", ""];

  gameOver = false;
  computerThinking = false;

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove(
      "x",
      "o",
      "win",
      "pop"
    );
  });

  statusText.textContent = "❌ دورك";
}

function createConfetti() {
  for (let i = 0; i < 35; i++) {
    const piece = document.createElement("div");

    piece.style.position = "fixed";
    piece.style.width = "8px";
    piece.style.height = "8px";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = "-10px";
    piece.style.background =
      `hsl(${Math.random() * 360}, 90%, 60%)`;
    piece.style.borderRadius = "3px";
    piece.style.zIndex = "9999";
    piece.style.pointerEvents = "none";

    document.body.appendChild(piece);

    const duration = 1000 + Math.random() * 1500;

    piece.animate(
      [
        {
          transform: "translateY(0) rotate(0deg)",
          opacity: 1
        },
        {
          transform:
            `translateY(110vh) rotate(${Math.random() * 720}deg)`,
          opacity: 0
        }
      ],
      {
        duration,
        easing: "cubic-bezier(.2,.7,.3,1)"
      }
    );

    setTimeout(() => {
      piece.remove();
    }, duration);
  }
}

statusText.textContent = "❌ دورك";
