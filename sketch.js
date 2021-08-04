let GRID_SIZE;
let FRAME_RATE;

let grid = [];
let stack = [];

let currentCell;

function reset() {
  grid = [];
  stack = [];

  GRID_SIZE = parseInt(document.querySelector('#gridSize').value);
  FRAME_RATE = parseInt(document.querySelector('#frameRate').value);

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      const cell = new Cell(col, row);
      grid.push(cell);
    }
  }

  frameRate(FRAME_RATE);
  currentCell = randomArrayValue(grid);
}

function setup() {
  createCanvas(600, 600);
  reset();
}

function draw() {
  background(72, 126, 176);
  noStroke();

  grid.forEach(cell => {
    cell.draw();
  });

  stack.forEach(cell => {
    if (!Cell.isCell(cell)) {
      cell = Cell.deserialize(Cell.serialize(cell));
    }

    cell.highlight([251, 197, 49, 50]);
  });

  if (!Cell.isCell(currentCell)) {
    currentCell = Cell.deserialize(Cell.serialize(currentCell));
  }

  if (currentCell) {
    currentCell.visited = true;

    if (stack.length > 0) {
      currentCell.highlight();
    }
  }

  const nextCell = currentCell.checkNeighbors();
  if (nextCell) {
    nextCell.visited = true;

    stack.push(currentCell);

    currentCell.removeWalls(nextCell);
    currentCell = nextCell;
  } else if (stack.length > 0) {
    currentCell = stack.pop();
  }

  let percentage = floor((grid.map(cell => cell.visited).filter(visited => visited).length / grid.length) * 100);
  document.querySelector('#percentage').innerHTML = `${percentage}%`;

  stroke(255, 255, 255);
  strokeWeight(1);

  for (let i = 0; i < 6; i++) {
    line(0, 0, 0, height);
    line(width, 0, width, height);
    line(0, 0, width, 0);
    line(0, height, width, height);
  }
}

function updateGridSize(value) {
  value = parseInt(value);

  grid = [];
  stack = [];

  GRID_SIZE = value;
  FRAME_RATE = parseInt(document.querySelector('#frameRate').value);

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      const cell = new Cell(col, row);
      grid.push(cell);
    }
  }

  frameRate(FRAME_RATE);
  currentCell = randomArrayValue(grid);
}

function updateFrameRate(value) {
  value = parseInt(value);

  if (!isNaN(value)) {
    FRAME_RATE = value;
    frameRate(value);
  }
}

function importJson() {
  const input = document.querySelector('#fileInput');

  const file = input.files[0]; 

  const reader = new FileReader();
  reader.readAsText(file, 'UTF-8');

  reader.onload = readerEvent => {
    try {
      const content = JSON.parse(readerEvent.target.result);
      content.cells = content.cells.map(Cell.deserialize);

      grid = [];
      stack = [];

      GRID_SIZE = content.gridSize;
      FRAME_RATE = content.frameRate;

      frameRate(FRAME_RATE);

      currentCell = Cell.deserialize(content.currentCell);

      grid = content.cells;
      stack = content.stack;

      document.querySelector('#gridSize').value = GRID_SIZE.toString();
      document.querySelector('#frameRate').value = FRAME_RATE.toString();
    } catch(e) {
      alert('This file can\'t be parsed!');
    }
  }
}

function exportJson() {
  const text = JSON.stringify({
    gridSize: GRID_SIZE,
    frameRate: FRAME_RATE,
    cells: grid.map(Cell.serialize),
    currentCell: Cell.serialize(currentCell),
    stack
  }, null, 2);

  const blob = new Blob([text], {
    type: 'text/plain; charset=utf-8'
  });

  saveAs(blob, Math.floor(Date.now() / 1000) + '.json');
}

function base64toBlob(base64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, {
    type: contentType
  });
}

function exportPng() {
  const canvas = document.getElementById("defaultCanvas0");

  let image = canvas.toDataURL("image/png");

  const prefixLength = 'data:image/png;base64'.length;
  image = image.substr(prefixLength + 1, image.length - prefixLength);

  const blob = base64toBlob(image, 'image/png');
  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, '_blank');
}