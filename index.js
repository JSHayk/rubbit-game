// State
const boardData = [];
const rabbitsData = [];
const wolfsData = [];
let isLose = false;
let isWin = false;
// DOM
const board = document.querySelector(".board");
const root = document.getElementById("root");

// Adding keyboard events
window.addEventListener("keydown", moveRabbit);

const start = () => {
  drawStartSection();
};

const setBoardData = (num) => {
  boardData.push(...getRandomBoardData(num));
  drawBoard();
  console.log(boardData, "boardDData");
};
function drawBoard() {
  if (isWin) {
    appendSection("./assets/win_picture.png", "You Won");
    return;
  } else if (isLose) {
    appendSection("./assets/lose_picture.png", "You Lose");
    return;
  }

  const boardContentEl = document.querySelector(".board-content");
  boardContentEl.innerHTML = "";
  boardData.forEach((x, idx) => {
    const boardRowEl = document.createElement("div");
    boardRowEl.classList.add("board-row");
    x.forEach((y) => {
      const src = checkHeroImage(y);
      boardRowEl.innerHTML += `
      <div class="board-row-square square-${idx + 1}">
          <img src=${src} alt="" />
      </div>
    `;
    });
    boardContentEl.appendChild(boardRowEl);
  });
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
function moveRabbit(e) {
  const { squareIndex, rowIndex } = rabbitsData[0];
  const start = 0;
  const end = boardData.length - 1;
  const payload = {
    moveLeft() {
      let nextSquareIndex = squareIndex - 1;
      rabbitAction({
        type: 1,
        next: nextSquareIndex,
        condition: squareIndex === 0,
        action() {
          return boardData.length - 1;
        },
      });
    },
    moveRight() {
      let nextSquareIndex = squareIndex + 1;
      rabbitAction({
        type: 1,
        next: nextSquareIndex,
        condition: squareIndex === boardData.length - 1,
        action() {
          return 0;
        },
      });
    },
    moveTop() {
      let nextRowIndex = rowIndex - 1;
      rabbitAction({
        type: 2,
        next: nextRowIndex,
        condition: rowIndex === 0,
        action() {
          return boardData.length - 1;
        },
      });
    },
    moveBottom() {
      let nextRowIndex = rowIndex + 1;
      rabbitAction({
        type: 2,
        next: nextRowIndex,
        condition: rowIndex === boardData.length - 1,
        action() {
          return 0;
        },
      });
    },
  };
  checkHeroMove(e.keyCode, payload);
}
function rabbitAction(data) {
  const { next, type, condition, action } = data;
  const { squareIndex, rowIndex } = rabbitsData[0];
  let moveFunc;
  let hero;
  let nextClone = next;
  useIf(condition, () => {
    nextClone = action();
  });
  if (type === 1) {
    hero = boardData[rowIndex][nextClone];
    moveFunc = moveRabbitHorizontal;
  } else if (type === 2) {
    hero = boardData[nextClone][squareIndex];
    moveFunc = moveRabbitVertical;
  }
  const { isPrevented } = checkNextHero(hero);
  if (isPrevented) return;
  moveFunc(nextClone);
  endRabbitMove();
}
function endRabbitMove() {
  drawBoard();
  moveWolfs();
}
function moveWolfs() {
  wolfsData.forEach((item, idx, data) => {
    const { rowIndex, squareIndex } = item;
    const { rowIndex: nearestRowIndex, squareIndex: nearestSquareIndex } =
      getWolfNearestMoveData(rowIndex, squareIndex);
    data[idx] = moveWolf({
      rowIndex,
      squareIndex,
      nearestRowIndex,
      nearestSquareIndex,
    });
    drawBoard();
  });
}
function moveWolf({
  rowIndex,
  squareIndex,
  nearestRowIndex,
  nearestSquareIndex,
}) {
  if (nearestRowIndex == null || nearestSquareIndex == null)
    return { rowIndex: null, squareIndex: null };
  const tmp = boardData[rowIndex][squareIndex];
  boardData[rowIndex][squareIndex] =
    boardData[nearestRowIndex][nearestSquareIndex];
  boardData[nearestRowIndex][nearestSquareIndex] = tmp;
  return { rowIndex: nearestRowIndex, squareIndex: nearestSquareIndex };
}
function getWolfNearestMoveData(rowIndex, squareIndex) {
  const wolfData = getWolfData(rowIndex, squareIndex);
  const coordinatesArr = Object.values(wolfData);
  const movesArr = getMovesArr(coordinatesArr);
  if (movesArr.length === 0) {
    return { rowIndex, squareIndex };
  }
  return findNearestMoveData(movesArr);
}
function getMovesArr(wolfArr) {
  const movesArr = [];
  wolfArr.forEach((item) => {
    const { value, x, y } = item;
    if (value === null || value === 1 || value === 3) return;
    const { isPrevented } = checkNextHero(value);
    if (isPrevented) return;
    const coordinate = distance(
      {
        x,
        y,
      },
      {
        x: rabbitsData[0].rowIndex,
        y: rabbitsData[0].squareIndex,
      }
    );
    movesArr.push({
      coordinate,
      rowIndex: x,
      squareIndex: y,
    });
  });
  return movesArr;
}
function findNearestMoveData(arr) {
  const nearestMoveData = arr.reduce((prev, curr) => {
    return prev.coordinate <= curr.coordinate ? prev : curr;
  });
  return nearestMoveData;
}
function fillArr(count, value) {
  return Array(count).fill(value);
}
function getRandomBoardData(num) {
  const heroes = getHeroesData(num);
  const randomBoard = getInitialBoard(num);
  randomBoard.forEach((x, rowIndex) => {
    x.forEach((y, squareIndex) => {
      const randomHeroIndex = Math.ceil(Math.random() * heroes.length - 1);
      const hero = heroes[randomHeroIndex];
      x[squareIndex] = hero;
      setHeroesData(hero, rowIndex, squareIndex); // Setting the positions of heroes
      heroes.splice(randomHeroIndex, 1); //  removeing the current item from array for not repeating
    });
  });
  return randomBoard;
}
function setHeroesData(hero, rowIndex, squareIndex) {
  const payload = {
    setRabbitsData() {
      rabbitsData.push({
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
  checkHeroData(hero, payload);
}
function getInitialBoard(count) {
  const initialBoard = [];
  fillArr(count, null).forEach(() => {
    initialBoard.push(fillArr(count, null));
  });
  return initialBoard;
}
function getHeroesData(num) {
  if (!num) throw new Error("Invalid arguments");
  let heroes = [];
  let wolfsCount = Math.ceil(num / 2);
  let fencesCount = Math.ceil(num - 1);
  let homeCount = 1;
  let rabbitsCount = 1;
  let emptySquareCount =
    num * num - wolfsCount - fencesCount - homeCount - rabbitsCount;
  heroes = [
    ...heroes,
    ...fillArr(wolfsCount, 1),
    ...fillArr(fencesCount, 4),
    ...fillArr(homeCount, 3),
    ...fillArr(rabbitsCount, 2),
    ...fillArr(emptySquareCount, 0),
  ];

  return heroes;
}
function distance(p1, p2) {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;
  const c = Math.sqrt(a * a + b * b);
  return c;
}
// Helpers
function moveRabbitVertical(nextRowIndex) {
  const { rowIndex, squareIndex } = rabbitsData[0];
  const boardRow = boardData[rowIndex];
  const tmp = boardRow[squareIndex];
  boardRow[squareIndex] = boardData[nextRowIndex][squareIndex];
  boardData[nextRowIndex][squareIndex] = tmp;
  rabbitsData[0] = { rowIndex: nextRowIndex, squareIndex };
}
function moveRabbitHorizontal(nextSquareIndex) {
  const { rowIndex, squareIndex } = rabbitsData[0];
  const boardRow = boardData[rowIndex];
  const tmp = boardRow[squareIndex];
  boardRow[squareIndex] = boardRow[nextSquareIndex];
  boardRow[nextSquareIndex] = tmp;
  rabbitsData[0] = { rowIndex, squareIndex: nextSquareIndex };
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
      isLose = true;
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
function getWolfData(rowIndex, squareIndex) {
  const boardRow = boardData[rowIndex];
  const bottomRow = boardData[rowIndex + 1] ?? null;
  const topRow = boardData[rowIndex - 1] ?? null;
  const leftSquare = boardRow[squareIndex - 1] ?? null;
  const rightSquare = boardRow[squareIndex + 1] ?? null;

  return {
    left: {
      value: leftSquare,
      x: rowIndex,
      y: squareIndex - 1,
    },
    right: {
      value: rightSquare,
      x: rowIndex,
      y: squareIndex + 1,
    },
    top: {
      value: topRow && topRow[squareIndex],
      x: rowIndex - 1,
      y: squareIndex,
    },
    bottom: {
      value: bottomRow && bottomRow[squareIndex],
      x: rowIndex + 1,
      y: squareIndex,
    },
  };
}
function drawStartSection() {
  board.classList.add("hide");
  const startSection = document.createElement("section");
  startSection.classList.add("start-section", "end-section");
  startSection.innerHTML = `
    <h1>Choose the Size</h1>
    <div class="start-section-buttons">
      <button onClick="setBoardSize(5)">5x5</button>
      <button onClick="setBoardSize(7)">7x7</button>
      <button onClick="setBoardSize(10)">10x10</button>
    </div>
  `;
  root.appendChild(startSection);
}
function setBoardSize(num) {
  setBoardData(num);
  const startSection = document.querySelector(".start-section");
  startSection.classList.add("hide");
  board.classList.add("show");
}
// Common
function checkHeroData(condition, payload) {
  useIf(condition === 2 || condition === 1, () => {
    console.log(true);
  });
  switch (condition) {
    case 2: // Rabbit
      payload?.setRabbitsData();
    case 1: // Wolfs
      payload?.setWolfsData();
    default:
      break;
  }
}
function checkHeroMove(condition, payload) {
  console.log(condition, "condition");
  switch (condition) {
    case 37: // Move rabbit to Left
      payload.moveLeft();
      break;
    case 38: // Move rabbit to Top,
      payload.moveTop();
      break;
    case 39: // Move rabbit to Right
      payload.moveRight();
      break;
    case 40: // Move rabbit to Bottom
      payload.moveBottom();
      break;
    default:
      break;
  }
}
function checkHeroImage(condition) {
  switch (condition) {
    case 2: // rabbit
      return "./assets/rabbit.png";
    case 1: // wolfs
      return "./assets/wolf.png";
    case 3:
      return "./assets/home.png";
    case 4:
      return "./assets/fence.png";
    default:
      break;
  }
}
function useIf(condition, action) {
  if (condition) {
    action();
  }
}

start();
