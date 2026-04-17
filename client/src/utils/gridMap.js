export class GridMap {
  constructor(width, height, cellSize) {
    this.width = width || 30
    this.height = height || 30
    this.cellSize = cellSize || 1
    this.cols = Math.ceil(this.width / this.cellSize)
    this.rows = Math.ceil(this.height / this.cellSize)
    this.grid = []
    for (var r = 0; r < this.rows; r++) {
      this.grid[r] = []
      for (var c = 0; c < this.cols; c++) {
        this.grid[r][c] = 0
      }
    }
    this.offsetX = -this.width / 2
    this.offsetZ = -this.height / 2
  }

  worldToGrid(x, z) {
    var col = Math.floor((x - this.offsetX) / this.cellSize)
    var row = Math.floor((z - this.offsetZ) / this.cellSize)
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

  findNearestFreeCell(row, col, maxRadii) {
    if (this.isFree(row, col)) return { row: row, col: col }
    maxRadii = maxRadii || 30 // max radius to search
    var queue = [{ row: row, col: col, dist: 0 }]
    var visited = {}
    visited[row + ',' + col] = true

    while (queue.length > 0) {
      var cur = queue.shift()
      if (cur.dist > maxRadii) return null

      if (this.isFree(cur.row, cur.col)) {
        return { row: cur.row, col: cur.col }
      }

      var dirs = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ]

      for (var i = 0; i < dirs.length; i++) {
        var nr = cur.row + dirs[i][0]
        var nc = cur.col + dirs[i][1]
        var key = nr + ',' + nc
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !visited[key]) {
          visited[key] = true
          queue.push({ row: nr, col: nc, dist: cur.dist + 1 })
        }
      }
    }
    return null
  }

  addObstacle(position, size, inflation) {
    inflation = inflation || 1
    var minX = position[0] - size[0] / 2 - inflation * this.cellSize
    var maxX = position[0] + size[0] / 2 + inflation * this.cellSize
    var minZ = position[2] - size[2] / 2 - inflation * this.cellSize
    var maxZ = position[2] + size[2] / 2 + inflation * this.cellSize
    for (var x = minX; x <= maxX; x += this.cellSize * 0.5) {
      for (var z = minZ; z <= maxZ; z += this.cellSize * 0.5) {
        var cell = this.worldToGrid(x, z)
        if (this.isInBounds(cell.row, cell.col)) {
          this.grid[cell.row][cell.col] = 1
        }
      }
    }
  }

  isInBounds(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols
  }

  isFree(row, col) {
    return this.isInBounds(row, col) && this.grid[row][col] === 0
  }

  isObstacle(row, col) {
    return this.isInBounds(row, col) && this.grid[row][col] === 1
  }

  getNeighbors(row, col) {
    var neighbors = []
    var dirs = [
      [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],
      [-1, -1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [1, 1, 1.414]
    ]
    for (var i = 0; i < dirs.length; i++) {
      var dr = dirs[i][0]
      var dc = dirs[i][1]
      var cost = dirs[i][2]
      var nr = row + dr
      var nc = col + dc
      if (this.isFree(nr, nc)) {
        if (Math.abs(dr) + Math.abs(dc) === 2) {
          if (!this.isFree(row + dr, col) || !this.isFree(row, col + dc)) continue
        }
        neighbors.push({ row: nr, col: nc, cost: cost })
      }
    }
    return neighbors
  }

  reset() {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== 1) this.grid[r][c] = 0
      }
    }
  }
}