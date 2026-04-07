export function PIDController(kp, ki, kd, config) {
  config = config || {}
  this.kp = kp || 1
  this.ki = ki || 0
  this.kd = kd || 0
  this.setpoint = 0
  this.integral = 0
  this.prevError = 0
  this.prevTime = Date.now()
  this.outputMin = config.outputMin !== undefined ? config.outputMin : -10
  this.outputMax = config.outputMax !== undefined ? config.outputMax : 10
  this.integralMin = config.integralMin !== undefined ? config.integralMin : -5
  this.integralMax = config.integralMax !== undefined ? config.integralMax : 5
  this.history = []
}

PIDController.prototype.setTarget = function (s) { this.setpoint = s }

PIDController.prototype.setGains = function (kp, ki, kd) {
  this.kp = kp
  this.ki = ki
  this.kd = kd
}

PIDController.prototype.update = function (currentValue) {
  var now = Date.now()
  var dt = Math.max(0.001, (now - this.prevTime) / 1000)
  this.prevTime = now

  var error = this.setpoint - currentValue
  var pTerm = this.kp * error

  this.integral += error * dt
  this.integral = Math.max(this.integralMin, Math.min(this.integralMax, this.integral))
  var iTerm = this.ki * this.integral

  var derivative = dt > 0 ? (error - this.prevError) / dt : 0
  var dTerm = this.kd * derivative
  this.prevError = error

  var output = pTerm + iTerm + dTerm
  output = Math.max(this.outputMin, Math.min(this.outputMax, output))

  this.history.push({ time: now, setpoint: this.setpoint, currentValue: currentValue, error: error, output: output })
  if (this.history.length > 200) this.history = this.history.slice(-200)

  return output
}

PIDController.prototype.reset = function () {
  this.integral = 0
  this.prevError = 0
  this.prevTime = Date.now()
  this.history = []
}

export function RobotMotorController() {
  this.speedPID = new PIDController(2.0, 0.5, 0.1, { outputMin: -5, outputMax: 5 })
  this.headingPID = new PIDController(3.0, 0.1, 0.5, { outputMin: -3, outputMax: 3 })
  this.currentWaypointIndex = 0
}

RobotMotorController.prototype.navigateToPoint = function (currentPos, targetPos, currentHeading) {
  var dx = targetPos.x - currentPos.x
  var dz = targetPos.z - currentPos.z
  var distance = Math.sqrt(dx * dx + dz * dz)
  var desiredHeading = Math.atan2(dx, dz)

  var headingError = desiredHeading - currentHeading
  while (headingError > Math.PI) headingError -= 2 * Math.PI
  while (headingError < -Math.PI) headingError += 2 * Math.PI

  var desiredSpeed = Math.min(distance * 0.8, 2.0)
  this.speedPID.setTarget(desiredSpeed)
  var linearVelocity = this.speedPID.update(0)

  this.headingPID.setTarget(0)
  var angularVelocity = this.headingPID.update(-headingError)

  var speedReduction = Math.max(0.2, 1 - Math.abs(headingError) / Math.PI)
  var arrived = distance < 0.3

  return {
    linearVelocity: arrived ? 0 : linearVelocity * speedReduction,
    angularVelocity: arrived ? 0 : angularVelocity,
    distance: distance,
    headingError: headingError * (180 / Math.PI),
    arrived: arrived
  }
}

RobotMotorController.prototype.followPath = function (currentPos, currentHeading, path) {
  if (!path || path.length === 0 || this.currentWaypointIndex >= path.length) {
    return { linearVelocity: 0, angularVelocity: 0, arrived: true, waypointIndex: this.currentWaypointIndex, totalWaypoints: path ? path.length : 0 }
  }
  var target = path[this.currentWaypointIndex]
  var result = this.navigateToPoint(currentPos, target, currentHeading)
  if (result.arrived && this.currentWaypointIndex < path.length - 1) {
    this.currentWaypointIndex++
  }
  return {
    linearVelocity: result.linearVelocity,
    angularVelocity: result.angularVelocity,
    distance: result.distance,
    arrived: result.arrived,
    waypointIndex: this.currentWaypointIndex,
    totalWaypoints: path.length
  }
}

RobotMotorController.prototype.resetNavigation = function () {
  this.currentWaypointIndex = 0
  this.speedPID.reset()
  this.headingPID.reset()
}