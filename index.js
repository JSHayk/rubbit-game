// State
const boardData = [];
const rubbitsData = [];
const wolfsData = [];
let isLose = false;
let isWin = false;

// Adding keyboard events
window.addEventListener("keydown", moveRubbit);

const setBoardData = (num) => {
  boardData.push(...getRandomBoardData(num));
  drawBoard();
};

function drawBoard() {
  if (isWin) {
    appendSection("../assets/win_picture.png", "You Won");
    return;
  } else if (isLose) {
    appendSection("../assets/lose_picture.png", "You Lose");
    return;
  }
  const boardContentEl = document.querySelector(".board-content");
  boardContentEl.innerHTML = "";
  for (let i = 0; i < boardData.length; i++) {
    const boardRowEl = document.createElement("div");
    boardRowEl.classList.add("board-row");
    for (let j = 0; j < boardData[i].length; j++) {
      boardRowEl.innerHTML += `
          <div class="board-row-square square-${i + 1}">
              <img src=${baseSwitch(boardData[i][j])} alt="" />
          </div>
        `;
    }
    boardContentEl.appendChild(boardRowEl);
  }
}
function drawSection(imagePath, content) {
  const winSectionEl = document.createElement("section");
  winSectionEl.classList.add("win-section", "end-section");
  winSectionEl.innerHTML = `
        <h1>${content}</h1>
        <img src=${imagePath} alt="win" />
        <button onClick="pageReload()">Play again</button>
    `;
  return winSectionEl;
}
// Move heroes
function moveRubbit(e) {
  const { squareIndex, rowIndex } = rubbitsData[0];
  const payload = {
    moveLeft() {
      let nextSquareIndex = squareIndex - 1;
      if (squareIndex === 0) {
        nextSquareIndex = boardData.length - 1;
      }
      const { isPrevented } = checkNextHero(
        boardData[rowIndex][nextSquareIndex]
      );
      if (isPrevented) return;
      moveRubbitHorizontal(nextSquareIndex);
      drawBoard();
    },
    moveRight() {
      let nextSquareIndex = squareIndex + 1;
      if (squareIndex === boardData.length - 1) {
        nextSquareIndex = 0;
      }
      const { isPrevented } = checkNextHero(
        boardData[rowIndex][nextSquareIndex]
      );
      if (isPrevented) return;
      moveRubbitHorizontal(nextSquareIndex);
      drawBoard();
    },
    moveTop() {
      let nextRowIndex = rowIndex - 1;
      if (rowIndex === 0) {
        nextRowIndex = boardData.length - 1;
      }
      const { isPrevented } = checkNextHero(
        boardData[nextRowIndex][squareIndex]
      );
      if (isPrevented) return;
      moveRubbitVertical(nextRowIndex);
      drawBoard();
    },
    moveBottom() {
      let nextRowIndex = rowIndex + 1;
      if (rowIndex === boardData.length - 1) {
        nextRowIndex = 0;
      }
      const { isPrevented } = checkNextHero(
        boardData[nextRowIndex][squareIndex]
      );
      if (isPrevented) return;
      moveRubbitVertical(nextRowIndex);
      drawBoard();
    },
  };
  baseSwitch(e.keyCode, payload);
}
function moveWolfs() {
  const { rowIndex, squareIndex } = rubbitsData;
  wolfsData.forEach((item) => {
    // boardData[item.rowIndex][squareIndex]
    // Write wolf eat logic, and it's end.But write better names for functions, and short for loops in one function for multy use
  });
}
function fillArr(count, value) {
  return Array(count).fill(value);
}
function getRandomBoardData(num) {
  const heroes = getHeroesData(num);
  const randomBoard = getInitialBoard(num);
  for (let i = 0; i < randomBoard.length; i++) {
    for (let j = 0; j < randomBoard[i].length; j++) {
      const randomHeroIndex = Math.ceil(Math.random() * heroes.length - 1);
      const hero = heroes[randomHeroIndex];
      randomBoard[i][j] = hero;
      setHeroesData(hero, i, j); // Setting the positions of heroes
      heroes.splice(randomHeroIndex, 1); //  removeing the current item from array for not repeating
    }
  }
  return randomBoard;
}
function setHeroesData(hero, rowIndex, squareIndex) {
  const payload = {
    setRubbitsData() {
      rubbitsData.push({
        rowIndex,
        squareIndex,
      });
    },
    setWolfsData() {
      wolfsData.push({
        rowIndex,
        squareIndex,
      });
    },
  };
  baseSwitch(hero, payload);
}
function getInitialBoard(count) {
  const initialBoard = [];
  for (let i = 0; i < count; i++) {
    initialBoard.push(fillArr(count, null));
  }
  return initialBoard;
}
function getHeroesData(num) {
  if (!num) throw new Error("Invalid arguments");
  let heroes = [];
  let wolfsCount = Math.ceil(num / 2);
  let fencesCount = Math.ceil(num - 1);
  let homeCount = 1;
  let rubbitCount = 1;
  let emptySquareCount =
    num * num - wolfsCount - fencesCount - homeCount - rubbitCount;
  heroes = [
    ...heroes,
    ...fillArr(wolfsCount, 1),
    ...fillArr(fencesCount, 4),
    ...fillArr(homeCount, 3),
    ...fillArr(rubbitCount, 2),
    ...fillArr(emptySquareCount, 0),
  ];

  return heroes;
}
// Helpers
function baseSwitch(condition, payload) {
  switch (condition) {
    case 2: // Rubbit
      payload?.setRubbitsData();
      return "../assets/rubbit.png";
    case 1: // Wolfs
      payload?.setWolfsData();
      return "../assets/wolf.png";
    case 3:
      return "../assets/home.png";
    case 4:
      return "../assets/fence.png";
    // Checking Heroes move
    case 37: // Move Rubbit to Left
      payload.moveLeft();
      break;
    case 38: // Move Rubbit to Top,
      payload.moveTop();
      break;
    case 39: // Move Rubbit to Right
      payload.moveRight();
      break;
    case 40: // Move Rubbit to Bottom
      payload.moveBottom();
      break;
    default:
      break;
  }
}
function moveRubbitVertical(nextRowIndex) {
  const { rowIndex, squareIndex } = rubbitsData[0];
  const tmp = boardData[rowIndex][squareIndex];
  boardData[rowIndex][squareIndex] = boardData[nextRowIndex][squareIndex];
  boardData[nextRowIndex][squareIndex] = tmp;
  rubbitsData[0] = { rowIndex: nextRowIndex, squareIndex };
}
function moveRubbitHorizontal(nextSquareIndex) {
  const { rowIndex, squareIndex } = rubbitsData[0];
  const tmp = boardData[rowIndex][squareIndex];
  boardData[rowIndex][squareIndex] = boardData[rowIndex][nextSquareIndex];
  boardData[rowIndex][nextSquareIndex] = tmp;
  rubbitsData[0] = { rowIndex, squareIndex: nextSquareIndex };
}
function checkNextHero(hero) {
  let isPrevented = false;
  switch (hero) {
    case 1:
      isLose = true;
      break;
    case 4:
      isPrevented = true;
      break;
    case 3:
      isWin = true;
      break;
    default:
      break;
  }
  return { isPrevented };
}
function pageReload() {
  window.location.reload();
}
function appendSection(imagePath, text) {
  if (!imagePath || !text) throw new Error("invalid arguments");
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.appendChild(drawSection(imagePath, text));
}
function useArray(action, end, start) {
  for (let i = start; i < end; i++) {
    action();
  }
}

setBoardData(5);
