function randomArrayValue(arr) {
  const index = floor(random(0, arr.length));
  return arr[index];
}

class Cell {
  constructor(col = 0, row = 0) {
    this.col = col;
    this.row = row;

    this.walls = [true, true, true, true];
    this.visited = false;
  }

  getSize() {
    return [width / GRID_SIZE, height / GRID_SIZE];
  }

  getPosition() {
    const [w, h] = this.getSize();
    return [this.row * w, this.col * h];
  }

  isValid() {
    const col = this.col + 1;
    const row = this.row + 1;

    if (col > GRID_SIZE || col <= 0) {
      return false;
    }

    if (row > GRID_SIZE || row <= 0) {
      return false;
    }

    return true;
  }

  checkNeighbors() {
    let neighbors = [
      new Cell(this.col - 1, this.row),
      new Cell(this.col + 1, this.row),
      new Cell(this.col, this.row - 1),
      new Cell(this.col, this.row + 1)
    ]

    neighbors = neighbors
      .filter(cell => cell.isValid())
      .map(cell => {
        return grid.find(c => cell.col === c.col && cell.row === c.row);
      })
      .filter(cell => !cell.visited);

    if (neighbors.length > 0) {
      return randomArrayValue(neighbors);
    }
  }

  removeWalls(cell) {
    const diffCols = this.col - cell.col;
    if (diffCols === 1) {
      this.walls[0] = false;
      cell.walls[2] = false;
    } else if (diffCols === -1) {
      this.walls[2] = false;
      cell.walls[0] = false;
    }

    const diffRows = this.row - cell.row;
    if (diffRows === 1) {
      this.walls[3] = false;
      cell.walls[1] = false;
    } else if (diffRows === -1) {
      this.walls[1] = false;
      cell.walls[3] = false;
    }
  }

  highlight(color = [156, 136, 255]) {
    const [x, y] = this.getPosition();
    const [w, h] = this.getSize();

    noStroke();
    fill(...color);
    rect(x, y, w, h);
  }

  draw() {
    const [x, y] = this.getPosition();
    const [w, h] = this.getSize();

    stroke(255, 255, 255);
    strokeWeight(2);

    if (this.walls[0]) {
      line(x, y, x + w, y);
    }

    if (this.walls[1]) {
      line(x + w, y, x + w, y + h);
    }

    if (this.walls[2]) {
      line(x + w, y + h, x, y + h);
    }

    if (this.walls[3]) {
      line(x, y + w, x, y);
    }

    if (this.visited) {
      noStroke();
      fill(53, 59, 72);
      rect(x, y, w + 1, w + 1);
    }
  }

  static serialize(cell) {
    return {
      column: cell.col + 1,
      row: cell.row + 1,
      visited: cell.visited,
      walls: {
        top: cell.walls[0],
        right: cell.walls[1],
        bottom: cell.walls[2],
        left: cell.walls[3]
      }
    }
  }

  static deserialize(data) {
    const cell = new Cell(data.column - 1, data.row - 1);
    cell.visited = data.visited;
    cell.walls = [
      data.walls.top,
      data.walls.right,
      data.walls.bottom,
      data.walls.left
    ];

    return cell;
  }

  static isCell(cell) {
    return cell instanceof Cell;
  }
}