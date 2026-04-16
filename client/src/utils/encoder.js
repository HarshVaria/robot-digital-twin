export class EncoderSensor {
  constructor(config) {
    config = config || {}
    this.ticksPerRev = config.ticksPerRevolution || 1024
    this.wheelRadius = config.wheelRadius || 0.25
    this.wheelCirc = 2 * Math.PI * this.wheelRadius
    this.noise = config.noise || 0.003
    this.leftTicks = 0
    this.rightTicks = 0
    this.totalLeftDist = 0
    this.totalRightDist = 0
  }

  update(leftSpeed, rightSpeed, dt) {
    var lt = Math.abs(leftSpeed) < 0.001 ? 0 : Math.round((leftSpeed * dt / (2 * Math.PI)) * this.ticksPerRev + this.gn() * this.noise * this.ticksPerRev)
    var rt = Math.abs(rightSpeed) < 0.001 ? 0 : Math.round((rightSpeed * dt / (2 * Math.PI)) * this.ticksPerRev + this.gn() * this.noise * this.ticksPerRev)

    this.leftTicks += lt
    this.rightTicks += rt

    var ld = (lt / this.ticksPerRev) * this.wheelCirc
    var rd = (rt / this.ticksPerRev) * this.wheelCirc
    this.totalLeftDist += Math.abs(ld)
    this.totalRightDist += Math.abs(rd)

    return {
      timestamp: Date.now(),
      left: {
        ticks: this.leftTicks,
        ticksDelta: lt,
        distance: ld,
        totalDistance: this.totalLeftDist,
        rpm: Math.max(0, Math.abs(leftSpeed / (2 * Math.PI)) * 60 + this.gn() * 0.5),
        speed: leftSpeed
      },
      right: {
        ticks: this.rightTicks,
        ticksDelta: rt,
        distance: rd,
        totalDistance: this.totalRightDist,
        rpm: Math.max(0, Math.abs(rightSpeed / (2 * Math.PI)) * 60 + this.gn() * 0.5),
        speed: rightSpeed
      },
      totalDistance: (this.totalLeftDist + this.totalRightDist) / 2
    }
  }

  reset() {
    this.leftTicks = 0
    this.rightTicks = 0
    this.totalLeftDist = 0
    this.totalRightDist = 0
  }

  gn() {
    var u = 0
    var v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}