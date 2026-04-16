// algorithms/dijkstra.js
// CommonJS Dijkstra's shortest-path for server-side usage

function dijkstra(gridMap, start, goal) {
    var t0 = Date.now()
    var startCell = gridMap.worldToGrid(start.x, start.z)
    var goalCell = gridMap.worldToGrid(goal.x, goal.z)

    if (gridMap.isObstacle(startCell.row, startCell.col) || gridMap.isObstacle(goalCell.row, goalCell.col)) {
        return {
            path: [],
            visited: [],
            iterations: 0,
            found: false,
            distance: Infinity,
            time: 0,
            algorithm: 'Dijkstra'
        }
    }

    var distances = {}
    var cameFrom = {}
    var visitedSet = {}
    var explored = []

    function key(r, c) { return r + ',' + c }

    var pq = []
    var startKey = key(startCell.row, startCell.col)
    distances[startKey] = 0
    pq.push({ row: startCell.row, col: startCell.col, dist: 0 })

    var iterations = 0

    while (pq.length > 0 && iterations < 50000) {
        iterations++
        pq.sort(function (a, b) { return a.dist - b.dist })
        var cur = pq.shift()
        if (!cur) break

        var ck = key(cur.row, cur.col)
        if (visitedSet[ck]) continue
        visitedSet[ck] = true
        explored.push({ row: cur.row, col: cur.col })

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
                visited: explored,
                iterations: iterations,
                found: true,
                distance: (distances[ck] !== undefined ? distances[ck] : Infinity) * gridMap.cellSize,
                time: (Date.now() - t0).toFixed(2),
                algorithm: 'Dijkstra'
            }
        }

        var neighbors = gridMap.getNeighbors(cur.row, cur.col)
        for (var i = 0; i < neighbors.length; i++) {
            var nb = neighbors[i]
            var nk = key(nb.row, nb.col)
            if (visitedSet[nk]) continue
            var currentDist = distances[ck] !== undefined ? distances[ck] : Infinity
            var newDist = currentDist + nb.cost
            var oldDist = distances[nk] !== undefined ? distances[nk] : Infinity
            if (newDist < oldDist) {
                distances[nk] = newDist
                cameFrom[nk] = ck
                pq.push({ row: nb.row, col: nb.col, dist: newDist })
            }
        }
    }

    return {
        path: [],
        visited: explored,
        iterations: iterations,
        found: false,
        distance: Infinity,
        time: (Date.now() - t0).toFixed(2),
        algorithm: 'Dijkstra'
    }
}

module.exports = dijkstra
