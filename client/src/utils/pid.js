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
  this.currentWaypointIndex = 0
  // Tunable gains (the UI sliders will control these)
  this.kp = 2.0   // proportional heading gain
  this.ki = 0.0   // not used in direct mode, kept for UI compat
  this.kd = 0.1   // derivative heading gain (damping)
  this.prevHeadingError = 0
  this.maxSpeed = 4.5         // cruise speed cap
  this.waypointRadius = 0.6   // how close to be "at" a waypoint
  this.finalRadius = 0.4      // arrival threshold for the LAST waypoint
  this.lookAhead = 1.5        // skip waypoints within this radius
}

RobotMotorController.prototype.navigateToPoint = function (currentPos, targetPos, currentHeading, isFinal, distToFinalGoal) {
  var dx = targetPos.x - currentPos.x
  var dz = targetPos.z - currentPos.z
  var distance = Math.sqrt(dx * dx + dz * dz)

  // Desired heading: atan2(dx, dz) matches the server's sin/cos convention
  var desiredHeading = Math.atan2(dx, dz)
  var headingError = desiredHeading - currentHeading

  // Normalize to [-PI, PI]
  while (headingError > Math.PI) headingError -= 2 * Math.PI
  while (headingError < -Math.PI) headingError += 2 * Math.PI

  var absHeadingError = Math.abs(headingError)

  // ── Angular velocity: proportional + derivative ──
  var dError = headingError - this.prevHeadingError
  var angularVelocity = this.kp * headingError + this.kd * dError
  angularVelocity = Math.max(-4.0, Math.min(4.0, angularVelocity))
  this.prevHeadingError = headingError

  // ── Linear velocity ──
  var linearVelocity

  // If heading is way off (> 60°), rotate in place first
  if (absHeadingError > Math.PI / 3) {
    linearVelocity = 0
  } else {
    // Base speed: proportional to distance, capped
    linearVelocity = Math.min(distance * 2.0, this.maxSpeed)

    // Reduce speed when heading is misaligned
    var headingFactor = Math.max(0.3, 1.0 - absHeadingError / (Math.PI / 2))
    linearVelocity *= headingFactor

    // Smooth deceleration near the FINAL goal
    if (isFinal && distToFinalGoal < 3.0) {
      var brakeFactor = Math.max(0.15, distToFinalGoal / 3.0)
      linearVelocity *= brakeFactor
    }
  }

  // Minimum velocity to avoid stalling (unless truly arrived)
  var threshold = isFinal ? this.finalRadius : this.waypointRadius
  var arrived = distance < threshold

  if (arrived) {
    linearVelocity = 0
    angularVelocity = 0
  } else if (linearVelocity > 0 && linearVelocity < 0.3) {
    linearVelocity = 0.3 // don't crawl, keep minimum momentum
  }

  return {
    linearVelocity: linearVelocity,
    angularVelocity: angularVelocity,
    distance: distance,
    headingError: headingError * (180 / Math.PI),
    arrived: arrived
  }
}

RobotMotorController.prototype.followPath = function (currentPos, currentHeading, path) {
  if (!path || path.length === 0 || this.currentWaypointIndex >= path.length) {
    return { linearVelocity: 0, angularVelocity: 0, arrived: true, waypointIndex: this.currentWaypointIndex, totalWaypoints: path ? path.length : 0 }
  }

  // ── Look-ahead: skip past any waypoints we're already close to ──
  while (this.currentWaypointIndex < path.length - 1) {
    var wp = path[this.currentWaypointIndex]
    var dxw = wp.x - currentPos.x
    var dzw = wp.z - currentPos.z
    var distToWp = Math.sqrt(dxw * dxw + dzw * dzw)
    if (distToWp < this.lookAhead) {
      this.currentWaypointIndex++
    } else {
      break
    }
  }

  var target = path[this.currentWaypointIndex]
  var isFinal = this.currentWaypointIndex >= path.length - 1

  // Distance to final goal for deceleration
  var finalGoal = path[path.length - 1]
  var dfx = finalGoal.x - currentPos.x
  var dfz = finalGoal.z - currentPos.z
  var distToFinalGoal = Math.sqrt(dfx * dfx + dfz * dfz)

  var result = this.navigateToPoint(currentPos, target, currentHeading, isFinal, distToFinalGoal)

  // Advance if we've arrived at a non-final waypoint
  if (result.arrived && !isFinal) {
    this.currentWaypointIndex++
  }

  return {
    linearVelocity: result.linearVelocity,
    angularVelocity: result.angularVelocity,
    distance: result.distance,
    arrived: result.arrived && isFinal,
    waypointIndex: this.currentWaypointIndex,
    totalWaypoints: path.length
  }
}

RobotMotorController.prototype.resetNavigation = function () {
  this.currentWaypointIndex = 0
  this.prevHeadingError = 0
}

// Compat: the UI PID sliders call setGains on speedPID
RobotMotorController.prototype.speedPID = {
  setGains: function () { } // no-op, gains set directly
}