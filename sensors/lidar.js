// sensors/lidar.js
// CommonJS LiDAR sensor simulation
// Called by server as: lidar(state) → returns scan data array

const OBSTACLES = [
    { position: [3, 0.5, 2], size: [1, 1, 1] },
    { position: [-2, 0.5, 4], size: [1.5, 1, 0.5] },
    { position: [5, 0.75, -3], size: [0.8, 1, 0.8] },
    { position: [-4, 0.5, -2], size: [2, 1, 1] },
    { position: [0, 0.5, 7], size: [3, 1, 0.5] },
    { position: [-6, 0.5, 6], size: [1, 1, 1] },
    { position: [7, 0.5, 5], size: [1.2, 1, 1.2] },
    { position: [-3, 0.5, -6], size: [0.8, 1, 2] },
    { position: [6, 0.5, -7], size: [1.5, 1, 0.8] },
    { position: [-7, 0.5, 0], size: [1, 1, 1.5] }
]

const NUM_RAYS = 180
const MAX_RANGE = 10
const MIN_RANGE = 0.15
const ANGULAR_RES = 360 / NUM_RAYS
const NOISE_STD = 0.02
const BOUNDARY = 14.5

function gaussNoise() {
    var u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function rayBox(ox, oz, dx, dz, bx, bz, bw, bh) {
    var hw = bw / 2, hh = bh / 2
    var tmin = -Infinity, tmax = Infinity

    if (Math.abs(dx) > 1e-8) {
        var t1 = (bx - hw - ox) / dx
        var t2 = (bx + hw - ox) / dx
        tmin = Math.max(tmin, Math.min(t1, t2))
        tmax = Math.min(tmax, Math.max(t1, t2))
    } else if (ox < bx - hw || ox > bx + hw) {
        return null
    }

    if (Math.abs(dz) > 1e-8) {
        var t3 = (bz - hh - oz) / dz
        var t4 = (bz + hh - oz) / dz
        tmin = Math.max(tmin, Math.min(t3, t4))
        tmax = Math.min(tmax, Math.max(t3, t4))
    } else if (oz < bz - hh || oz > bz + hh) {
        return null
    }

    if (tmax >= tmin && tmax > 0) {
        return tmin > 0 ? tmin : tmax
    }
    return null
}

function checkWalls(ox, oz, dx, dz) {
    var b = BOUNDARY
    var min = Infinity
    var walls = [
        { val: -b, dir: dz, orig: oz, cd: dx, co: ox },
        { val: b, dir: dz, orig: oz, cd: dx, co: ox },
        { val: -b, dir: dx, orig: ox, cd: dz, co: oz },
        { val: b, dir: dx, orig: ox, cd: dz, co: oz }
    ]
    for (var i = 0; i < walls.length; i++) {
        var w = walls[i]
        if (Math.abs(w.dir) > 1e-8) {
            var t = (w.val - w.orig) / w.dir
            if (t > 0 && t < min) {
                var cp = w.co + w.cd * t
                if (cp >= -b && cp <= b) min = t
            }
        }
    }
    return min < Infinity ? min : null
}

function castRay(ox, oz, angle, obstacles) {
    var dx = Math.cos(angle)
    var dz = Math.sin(angle)
    var closest = MAX_RANGE
    var hit = false

    for (var i = 0; i < obstacles.length; i++) {
        var obs = obstacles[i]
        var d = rayBox(ox, oz, dx, dz, obs.position[0], obs.position[2], obs.size[0], obs.size[2])
        if (d !== null && d < closest && d > MIN_RANGE) {
            closest = d
            hit = true
        }
    }

    var wd = checkWalls(ox, oz, dx, dz)
    if (wd !== null && wd < closest && wd > MIN_RANGE) {
        closest = wd
        hit = true
    }

    if (hit) {
        closest += gaussNoise() * NOISE_STD
        closest = Math.max(MIN_RANGE, closest)
    }

    return {
        distance: closest,
        hit: hit,
        point: { x: ox + dx * closest, z: oz + dz * closest }
    }
}

/**
 * Perform a LiDAR scan given the robot state.
 * state = { x, y, theta } OR { position: {x,z}, rotation: {y} }
 * Returns an array of ray results.
 */
function lidar(state) {
    var rx, rz, heading

    if (state.position) {
        rx = state.position.x
        rz = state.position.z !== undefined ? state.position.z : state.position.y
        heading = state.rotation ? state.rotation.y : 0
    } else {
        rx = state.x || 0
        rz = state.y || 0
        heading = state.theta || 0
    }

    var scanData = []
    for (var i = 0; i < NUM_RAYS; i++) {
        var localAngle = (i * ANGULAR_RES * Math.PI) / 180
        var worldAngle = localAngle + heading
        var ray = castRay(rx, rz, worldAngle, OBSTACLES)
        scanData.push({
            index: i,
            angle: i * ANGULAR_RES,
            angleRad: localAngle,
            distance: ray.distance,
            hit: ray.hit,
            point: ray.point
        })
    }
    return scanData
}

module.exports = lidar
