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
    appendSection("./assets/win_picture.png", "You Won");
    return;
  } else if (isLose) {
    appendSection("./assets/lose_picture.png", "You Lose");
    return;
  }

  const boardContentEl = document.querySelector(".board-content");
  boardContentEl.innerHTML = "";
  useFor((i) => {
    const boardRowEl = document.createElement("div");
    boardRowEl.classList.add("board-row");
    useFor((j) => {
      const src = useSwitch(boardData[i][j]);
      boardRowEl.innerHTML += `
            <div class="board-row-square square-${i + 1}">
                <img src=${src} alt="" />
            </div>
          `;
    }, boardData[i].length);
    boardContentEl.appendChild(boardRowEl);
  }, boardData.length);
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
      useIf(squareIndex === 0, () => (nextSquareIndex = boardData.length - 1));
      const { isPrevented } = checkNextHero(
        boardData[rowIndex][nextSquareIndex]
      );
      if (isPrevented) return;
      moveRubbitHorizontal(nextSquareIndex);
      endRubbitMove();
    },
    moveRight() {
      let nextSquareIndex = squareIndex + 1;
      useIf(squareIndex === boardData.length - 1, () => (nextSquareIndex = 0));
      const { isPrevented } = checkNextHero(
        boardData[rowIndex][nextSquareIndex]
      );
      if (isPrevented) return;
      moveRubbitHorizontal(nextSquareIndex);
      endRubbitMove();
    },
    moveTop() {
      let nextRowIndex = rowIndex - 1;
      useIf(rowIndex === 0, () => (nextRowIndex = boardData.length - 1));
      const { isPrevented } = checkNextHero(
        boardData[nextRowIndex][squareIndex]
      );
      if (isPrevented) return;
      moveRubbitVertical(nextRowIndex);
      endRubbitMove();
    },
    moveBottom() {
      let nextRowIndex = rowIndex + 1;
      useIf(rowIndex === boardData.length - 1, () => (nextRowIndex = 0));
      const { isPrevented } = checkNextHero(
        boardData[nextRowIndex][squareIndex]
      );
      if (isPrevented) return;
      moveRubbitVertical(nextRowIndex);
      endRubbitMove();
    },
  };
  useSwitch(e.keyCode, payload);
}
function endRubbitMove() {
  drawBoard();
  moveWolfs();
}
function moveWolfs() {
  useFor((i) => {
    const { rowIndex, squareIndex } = wolfsData[i];
    const { rowIndex: nearestRowIndex, squareIndex: nearestSquareIndex } =
      getWolfNearestMoveData(rowIndex, squareIndex);
    wolfsData[i] = moveWolf({
      rowIndex,
      squareIndex,
      nearestRowIndex,
      nearestSquareIndex,
    });
    drawBoard();
  }, wolfsData.length);
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
  useFor((i) => {
    const { value, x, y } = wolfArr[i];
    if (value === null || value === 1 || value === 3) return;
    const { isPrevented } = checkNextHero(value);
    if (isPrevented) return;
    const coordinate = distance(
      {
        x,
        y,
      },
      {
        x: rubbitsData[0].rowIndex,
        y: rubbitsData[0].squareIndex,
      }
    );
    movesArr.push({
      coordinate,
      rowIndex: x,
      squareIndex: y,
    });
  }, wolfArr.length);
  return movesArr;
}
function findNearestMoveData(arr) {
  let nearestMoveData = arr[0];
  let nearestCoordinate = arr[0]?.coordinate;
  useFor(
    (i) => {
      const { coordinate } = arr[i];
      useIf(coordinate === 0 && nearestCoordinate === 0, () => {
        const { squareIndex } = rubbitsData[0];
        useIf(squareIndex > arr[i].squareIndex, () => {
          nearestMoveData = arr[i];
          return;
        });
      });
      useIf(coordinate < nearestCoordinate, () => {
        nearestCoordinate = coordinate;
        nearestMoveData = arr[i];
      });
    },
    arr.length,
    1
  );

  return nearestMoveData;
}
function fillArr(count, value) {
  return Array(count).fill(value);
}
function getRandomBoardData(num) {
  const heroes = getHeroesData(num);
  const randomBoard = getInitialBoard(num);
  useFor((i) => {
    useFor((j) => {
      const randomHeroIndex = Math.ceil(Math.random() * heroes.length - 1);
      const hero = heroes[randomHeroIndex];
      randomBoard[i][j] = hero;
      setHeroesData(hero, i, j); // Setting the positions of heroes
      heroes.splice(randomHeroIndex, 1); //  removeing the current item from array for not repeating
    }, randomBoard[i].length);
  }, randomBoard.length);
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
  useSwitch(hero, payload);
}
function getInitialBoard(count) {
  const initialBoard = [];
  useFor(() => {
    initialBoard.push(fillArr(count, null));
  }, count);
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
// Common
function useSwitch(condition, payload) {
  switch (condition) {
    case 2: // Rubbit
      payload?.setRubbitsData();
      return "./assets/rubbit.png";
    case 1: // Wolfs
      payload?.setWolfsData();
      return "./assets/wolf.png";
    case 3:
      return "./assets/home.png";
    case 4:
      return "./assets/fence.png";
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
function useFor(action, end, start = 0) {
  for (let i = start; i < end; i++) {
    action(i);
  }
}
function useIf(condition, action) {
  if (condition) {
    action();
  }
}

setBoardData(5);
