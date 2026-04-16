// sensors/encoder.js
// CommonJS wheel encoder sensor simulation
// Called by server as: encoder(state) → returns wheel encoder data

var TICKS_PER_REV = 1024
var WHEEL_RADIUS = 0.25
var WHEEL_CIRC = 2 * Math.PI * WHEEL_RADIUS
var NOISE = 0.003

var leftTicks = 0
var rightTicks = 0
var totalLeftDist = 0
var totalRightDist = 0
var prevTimestamp = Date.now()

function gaussNoise() {
    var u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * Generate encoder readings from the robot state.
 * state = { x, y, theta, velocity, angularVelocity }
 *   OR   { position, rotation, velocity, speed, angularVelocity }
 */
function encoder(state) {
    var now = Date.now()
    var dt = Math.max(0.001, (now - prevTimestamp) / 1000)
    prevTimestamp = now

    // Derive wheel speeds from linear + angular velocity (differential drive)
    var linearSpeed
    if (typeof state.velocity === 'object' && state.velocity !== null) {
        var vx = state.velocity.x || 0
        var vz = state.velocity.z || 0
        linearSpeed = Math.sqrt(vx * vx + vz * vz)
    } else {
        linearSpeed = Math.abs(state.velocity || state.speed || 0)
    }

    var angVel = state.angularVelocity || 0
    var wheelBase = 0.5 // metres between wheels

    // v_left  = v - omega * L/2
    // v_right = v + omega * L/2
    var leftSpeed = (linearSpeed - angVel * wheelBase / 2) / WHEEL_RADIUS
    var rightSpeed = (linearSpeed + angVel * wheelBase / 2) / WHEEL_RADIUS

    var lt = Math.round((leftSpeed * dt / (2 * Math.PI)) * TICKS_PER_REV + gaussNoise() * NOISE * TICKS_PER_REV)
    var rt = Math.round((rightSpeed * dt / (2 * Math.PI)) * TICKS_PER_REV + gaussNoise() * NOISE * TICKS_PER_REV)

    leftTicks += lt
    rightTicks += rt

    var ld = (lt / TICKS_PER_REV) * WHEEL_CIRC
    var rd = (rt / TICKS_PER_REV) * WHEEL_CIRC
    totalLeftDist += Math.abs(ld)
    totalRightDist += Math.abs(rd)

    return {
        timestamp: now,
        left: {
            ticks: leftTicks,
            ticksDelta: lt,
            distance: ld,
            totalDistance: totalLeftDist,
            rpm: Math.max(0, Math.abs(leftSpeed / (2 * Math.PI)) * 60 + gaussNoise() * 0.5),
            speed: leftSpeed
        },
        right: {
            ticks: rightTicks,
            ticksDelta: rt,
            distance: rd,
            totalDistance: totalRightDist,
            rpm: Math.max(0, Math.abs(rightSpeed / (2 * Math.PI)) * 60 + gaussNoise() * 0.5),
            speed: rightSpeed
        },
        totalDistance: (totalLeftDist + totalRightDist) / 2
    }
}

module.exports = encoder
