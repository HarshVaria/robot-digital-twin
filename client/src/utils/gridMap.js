export class GridMap {
  constructor(width = 30, height = 30, cellSize = 1) {
    this.width = width
    this.height = height
    this.cellSize = cellSize

    this.cols = Math.ceil(width / cellSize)
    this.rows = Math.ceil(height / cellSize)

    this.offsetX = -width / 2
    this.offsetZ = -height / 2

    this.grid = []
    for (let r = 0; r < this.rows; r++) {
      const row = []
      for (let c = 0; c < this.cols; c++) {
        row.push(0) // 0 = free cell
      }
      this.grid.push(row)
    }
  }

  worldToGrid(x, z) {
    const col = Math.floor((x - this.offsetX) / this.cellSize)
    const row = Math.floor((z - this.offsetZ) / this.cellSize)

    return {
      row: Math.max(0, Math.min(this.rows - 1, row)),
      col: Math.max(0, Math.min(this.cols - 1, col))
    }
  }

  gridToWorld(row, col) {
    return {
      x: col * this.cellSize + this.offsetX + this.cellSize / 2,
      z: row * this.cellSize + this.offsetZ + this.cellSize / 2
    }
  }

  isInBounds(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols
  }

  isFree(row, col) {
    return this.isInBounds(row, col) && this.grid[row][col] === 0
  }

  setObstacle(row, col) {
    if (this.isInBounds(row, col)) {
      this.grid[row][col] = 1
    }
  }

  clearCell(row, col) {
    if (this.isInBounds(row, col)) {
      this.grid[row][col] = 0
    }
  }

  reset() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = 0
      }
    }
  }
}