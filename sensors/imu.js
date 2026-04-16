// sensors/imu.js
// CommonJS IMU sensor simulation
// Called by server as: imu(state) → returns IMU reading

var prevVelocity = { x: 0, y: 0, z: 0 }
var prevTimestamp = Date.now()
var gyroBias = {
    x: (Math.random() - 0.5) * 0.002,
    y: (Math.random() - 0.5) * 0.002,
    z: (Math.random() - 0.5) * 0.002
}

var ACC_NOISE = 0.1
var GYRO_NOISE = 0.01
var MAG_NOISE = 0.05

function gaussNoise() {
    var u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * Generate an IMU reading from the robot state.
 * state = { x, y, theta, velocity, angularVelocity }
 *   OR   { position, rotation, velocity, angularVelocity }
 */
function imu(state) {
    var now = Date.now()
    var dt = Math.max(0.001, (now - prevTimestamp) / 1000)
    prevTimestamp = now

    // Resolve velocity
    var vel
    if (typeof state.velocity === 'object' && state.velocity !== null) {
        vel = { x: state.velocity.x || 0, y: state.velocity.y || 0, z: state.velocity.z || 0 }
    } else {
        var spd = state.velocity || state.speed || 0
        var theta = state.theta || (state.rotation ? state.rotation.y : 0) || 0
        vel = { x: spd * Math.sin(theta), y: 0, z: spd * Math.cos(theta) }
    }

    var angVel = state.angularVelocity || 0
    var heading = state.theta || (state.rotation ? state.rotation.y : 0) || 0

    var acceleration = {
        x: (vel.x - prevVelocity.x) / dt + gaussNoise() * ACC_NOISE,
        y: 9.81 + (vel.y - prevVelocity.y) / dt + gaussNoise() * ACC_NOISE,
        z: (vel.z - prevVelocity.z) / dt + gaussNoise() * ACC_NOISE
    }

    var gyroscope = {
        x: gyroBias.x + gaussNoise() * GYRO_NOISE,
        y: angVel + gyroBias.y + gaussNoise() * GYRO_NOISE,
        z: gyroBias.z + gaussNoise() * GYRO_NOISE
    }

    var magnetometer = {
        x: Math.cos(heading) + gaussNoise() * MAG_NOISE,
        y: 0,
        z: Math.sin(heading) + gaussNoise() * MAG_NOISE
    }

    var orientation = {
        roll: Math.atan2(acceleration.y, acceleration.z) * (180 / Math.PI),
        pitch: Math.atan2(-acceleration.x, Math.sqrt(acceleration.y * acceleration.y + acceleration.z * acceleration.z)) * (180 / Math.PI),
        yaw: heading * (180 / Math.PI)
    }

    prevVelocity = { x: vel.x, y: vel.y, z: vel.z }

    return {
        timestamp: now,
        acceleration: acceleration,
        gyroscope: gyroscope,
        magnetometer: magnetometer,
        orientation: orientation,
        temperature: 25 + gaussNoise() * 0.5
    }
}

module.exports = imu
