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
      moveWolfs();
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
      moveWolfs();
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
      moveWolfs();
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
      moveWolfs();
    },
  };
  baseSwitch(e.keyCode, payload);
}
function moveWolfs() {
  baseForLoop((i) => {
    const { rowIndex, squareIndex } = wolfsData[i];
    const { x, y } = getWolfNearestMove(rowIndex, squareIndex);
  }, wolfsData.length);

  // const num = distance(
  //   {
  //     x: item.rowIndex,
  //     y: item.squareIndex,
  //   },
  //   {
  //     x: rowIndex,
  //     y: squareIndex,
  //   }
  // );
}

function getWolfNearestMove(rowIndex, squareIndex) {
  const nearestMove = { x: null, y: null };
  const wolfData = getWolfData(rowIndex, squareIndex);
  const valuesArr = Object.values(wolfData);
  baseForLoop((i) => {
    const { value, x, y, type } = valuesArr[i];
    if (value === null || value === 1 || value === 3) return;
    const { isPrevented } = checkNextHero(value);
    if (isPrevented) return;
  }, valuesArr.length);

  return nearestMove;
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
function distance(p1, p2) {
  const a = p1.x - p2.x;
  const b = p2.y - p2.y;
  return Math.pow(a * a + b * b, 2);
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
function baseForLoop(action, end, start = 0) {
  for (let i = start; i < end; i++) {
    action(i);
  }
}
function moveRubbitVertical(nextRowIndex) {
  const { rowIndex, squareIndex } = rubbitsData[0];
  const boardRow = boardData[rowIndex];
  const tmp = boardRow[squareIndex];
  boardRow[squareIndex] = boardData[nextRowIndex][squareIndex];
  boardData[nextRowIndex][squareIndex] = tmp;
  rubbitsData[0] = { rowIndex: nextRowIndex, squareIndex };
}
function moveRubbitHorizontal(nextSquareIndex) {
  const { rowIndex, squareIndex } = rubbitsData[0];
  const boardRow = boardData[rowIndex];
  const tmp = boardRow[squareIndex];
  boardRow[squareIndex] = boardRow[nextSquareIndex];
  boardRow[nextSquareIndex] = tmp;
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
    case 2:
      // isLose = true;
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
function getWolfData(rowIndex, squareIndex) {
  const boardRow = boardData[rowIndex];
  const bottomRow = boardData[rowIndex + 1] ?? null;
  const topRow = boardData[rowIndex - 1] ?? null;
  return {
    left: {
      value: boardRow[squareIndex - 1] ?? null,
      x: rowIndex,
      y: squareIndex - 1,
      type: "left",
    },
    right: {
      value: boardRow[squareIndex + 1] ?? null,
      x: rowIndex,
      y: squareIndex + 1,
      type: "right",
    },
    top: {
      value: topRow && topRow[squareIndex],
      x: rowIndex - 1,
      y: squareIndex,
      type: "top",
    },
    bottom: {
      value: bottomRow && bottomRow[squareIndex],
      x: rowIndex + 1,
      y: squareIndex,
      type: "bottom",
    },
  };
}

setBoardData(5);
