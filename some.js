const arr = [
  {
    coordinate: 1,
    rowIndex: 0,
    squareIndex: 0,
  },
  {
    coordinate: 1,
    rowIndex: 0,
    squareIndex: 2,
  },
];

function find(rowIndex, squareIndex) {
  const obj = {};

  for (let i = 0; i < arr.length; i++) {
    obj[
      Math.abs(arr[i].rowIndex - rowIndex) +
        Math.abs(arr[i].squareIndex - squareIndex)
    ] = arr[i];
  }
  return obj[Math.min(...Object.keys(obj))];
}

console.log(find(1, 0)); // 5

//  rubbit 3, 3

// result  3, 0
