// algorithms/astar.js
// CommonJS A* pathfinding for server-side usage

const GridMap = require('./gridMap')

// ── Min-heap (priority queue sorted by f-score) ────────────────────
function MinHeap() {
    this.heap = []
}

MinHeap.prototype.push = function (item) {
    this.heap.push(item)
    var idx = this.heap.length - 1
    while (idx > 0) {
        var parent = Math.floor((idx - 1) / 2)
        if (this.heap[idx].f < this.heap[parent].f) {
            var temp = this.heap[idx]
            this.heap[idx] = this.heap[parent]
            this.heap[parent] = temp
            idx = parent
        } else {
            break
        }
    }
}

MinHeap.prototype.pop = function () {
    if (this.heap.length === 0) return null
    var top = this.heap[0]
    var last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
        this.heap[0] = last
        var idx = 0
        var len = this.heap.length
        while (true) {
            var smallest = idx
            var l = 2 * idx + 1
            var r = 2 * idx + 2
            if (l < len && this.heap[l].f < this.heap[smallest].f) smallest = l
            if (r < len && this.heap[r].f < this.heap[smallest].f) smallest = r
            if (smallest !== idx) {
                var temp = this.heap[idx]
                this.heap[idx] = this.heap[smallest]
                this.heap[smallest] = temp
                idx = smallest
            } else {
                break
            }
        }
    }
    return top
}

// ── Full A* on a GridMap ────────────────────────────────────────────
function astarSearch(gridMap, start, goal) {
    var t0 = Date.now()
    var startCell = gridMap.worldToGrid(start.x, start.z)
    var goalCell = gridMap.worldToGrid(goal.x, goal.z)

    // Fallback to nearest free cells if exactly on an obstacle
    startCell = gridMap.findNearestFreeCell(startCell.row, startCell.col, 5) || startCell
    goalCell = gridMap.findNearestFreeCell(goalCell.row, goalCell.col, 30) || goalCell

    if (gridMap.isObstacle(startCell.row, startCell.col) || gridMap.isObstacle(goalCell.row, goalCell.col)) {
        return {
            path: [],
            visited: [],
            iterations: 0,
            found: false,
            distance: Infinity,
            time: 0,
            algorithm: 'A*'
        }
    }

    var openSet = new MinHeap()
    var closedSet = {}
    var cameFrom = {}
    var gScore = {}
    var visited = []

    function key(r, c) { return r + ',' + c }
    function heuristic(r1, c1, r2, c2) {
        return Math.sqrt((r1 - r2) * (r1 - r2) + (c1 - c2) * (c1 - c2))
    }

    var startKey = key(startCell.row, startCell.col)
    gScore[startKey] = 0
    openSet.push({
        row: startCell.row,
        col: startCell.col,
        g: 0,
        f: heuristic(startCell.row, startCell.col, goalCell.row, goalCell.col)
    })

    var iterations = 0

    while (openSet.heap.length > 0 && iterations < 50000) {
        iterations++
        var cur = openSet.pop()
        if (!cur) break

        var ck = key(cur.row, cur.col)
        if (closedSet[ck]) continue
        closedSet[ck] = true
        visited.push({ row: cur.row, col: cur.col })

        if (cur.row === goalCell.row && cur.col === goalCell.col) {
            var path = []
            var k = ck
            while (k) {
                var parts = k.split(',')
                var r = parseInt(parts[0])
                var c = parseInt(parts[1])
                var wp = gridMap.gridToWorld(r, c)
                path.unshift({ x: wp.x, z: wp.z, row: r, col: c })
                k = cameFrom[k] || null
            }
            return {
                path: path,
                visited: visited,
                iterations: iterations,
                found: true,
                distance: (gScore[ck] !== undefined ? gScore[ck] : Infinity) * gridMap.cellSize,
                time: (Date.now() - t0).toFixed(2),
                algorithm: 'A*'
            }
        }

        var neighbors = gridMap.getNeighbors(cur.row, cur.col)
        for (var i = 0; i < neighbors.length; i++) {
            var nb = neighbors[i]
            var nk = key(nb.row, nb.col)
            if (closedSet[nk]) continue
            var currentScore = gScore[ck] !== undefined ? gScore[ck] : Infinity
            var tentativeG = currentScore + nb.cost
            var neighborScore = gScore[nk] !== undefined ? gScore[nk] : Infinity
            if (tentativeG < neighborScore) {
                cameFrom[nk] = ck
                gScore[nk] = tentativeG
                openSet.push({
                    row: nb.row,
                    col: nb.col,
                    g: tentativeG,
                    f: tentativeG + heuristic(nb.row, nb.col, goalCell.row, goalCell.col)
                })
            }
        }
    }

    return {
        path: [],
        visited: visited,
        iterations: iterations,
        found: false,
        distance: Infinity,
        time: (Date.now() - t0).toFixed(2),
        algorithm: 'A*'
    }
}

// ── Simplified wrapper used by robotController.js ───────────────────
// robotController calls:  const path = astar(this.state)
// where state has { x, y, theta, target: { x, y } }
function astarFromState(state) {
    var gridMap = new GridMap(30, 30, 1)
    var start = { x: state.x, z: state.y }
    var goal = { x: state.target.x, z: state.target.y }
    var result = astarSearch(gridMap, start, goal)
    return result.path
}

// Export both: the full search and the state-wrapper
module.exports = astarFromState
module.exports.astarSearch = astarSearch
