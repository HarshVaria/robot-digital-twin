export class IMUSensor {
  constructor(config) {
    config = config || {}
    this.accNoise = config.accNoise || 0.1
    this.gyroNoise = config.gyroNoise || 0.01
    this.magNoise = config.magNoise || 0.05
    this.gyroBias = {
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002
    }
    this.prevVelocity = { x: 0, y: 0, z: 0 }
    this.prevTimestamp = Date.now()
  }

  update(robotState) {
    var now = Date.now()
    var dt = Math.max(0.001, (now - this.prevTimestamp) / 1000)
    this.prevTimestamp = now
    var vel = robotState.velocity || { x: 0, y: 0, z: 0 }
    var angVel = robotState.angularVelocity || 0
    var heading = robotState.heading || 0

    var acceleration = {
      x: (vel.x - this.prevVelocity.x) / dt + this.gn() * this.accNoise,
      y: 9.81 + (vel.y - this.prevVelocity.y) / dt + this.gn() * this.accNoise,
      z: (vel.z - this.prevVelocity.z) / dt + this.gn() * this.accNoise
    }

    var gyroscope = {
      x: this.gyroBias.x + this.gn() * this.gyroNoise,
      y: angVel + this.gyroBias.y + this.gn() * this.gyroNoise,
      z: this.gyroBias.z + this.gn() * this.gyroNoise
    }

    var magnetometer = {
      x: Math.cos(heading) + this.gn() * this.magNoise,
      y: 0,
      z: Math.sin(heading) + this.gn() * this.magNoise
    }

    var orientation = {
      roll: Math.atan2(acceleration.y, acceleration.z) * (180 / Math.PI),
      pitch: Math.atan2(-acceleration.x, Math.sqrt(acceleration.y * acceleration.y + acceleration.z * acceleration.z)) * (180 / Math.PI),
      yaw: heading * (180 / Math.PI)
    }

    this.prevVelocity = { x: vel.x, y: vel.y, z: vel.z }

    return {
      timestamp: now,
      acceleration: acceleration,
      gyroscope: gyroscope,
      magnetometer: magnetometer,
      orientation: orientation,
      temperature: 25 + this.gn() * 0.5
    }
  }

  gn() {
    var u = 0
    var v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  reset() {
    this.prevVelocity = { x: 0, y: 0, z: 0 }
    this.prevTimestamp = Date.now()
  }
}