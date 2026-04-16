// algorithms/pid.js
// CommonJS PID controller for server-side robot control
//
// robotController.js calls:
//   this.pid = new PID(1.0, 0.1, 0.05)
//   const control = this.pid.compute(this.state, target)
//   control.linear  -> linear velocity
//   control.angular -> angular velocity

class PID {
    constructor(kp, ki, kd, config) {
        config = config || {}
        this.kp = kp || 1
        this.ki = ki || 0
        this.kd = kd || 0
        this.integral = 0
        this.prevError = 0
        this.prevTime = Date.now()
        this.outputMin = config.outputMin !== undefined ? config.outputMin : -10
        this.outputMax = config.outputMax !== undefined ? config.outputMax : 10
        this.integralMin = config.integralMin !== undefined ? config.integralMin : -5
        this.integralMax = config.integralMax !== undefined ? config.integralMax : 5
    }

    /**
     * Generic PID update: returns a control output for a single error value.
     */
    update(currentValue, setpoint) {
        var now = Date.now()
        var dt = Math.max(0.001, (now - this.prevTime) / 1000)
        this.prevTime = now

        var error = setpoint - currentValue
        var pTerm = this.kp * error

        this.integral += error * dt
        this.integral = Math.max(this.integralMin, Math.min(this.integralMax, this.integral))
        var iTerm = this.ki * this.integral

        var derivative = dt > 0 ? (error - this.prevError) / dt : 0
        var dTerm = this.kd * derivative
        this.prevError = error

        var output = pTerm + iTerm + dTerm
        return Math.max(this.outputMin, Math.min(this.outputMax, output))
    }

    /**
     * Compute control commands from robot state → target waypoint.
     * state = { x, y, theta }
     * target = { x, z }  (z maps to the state's y-axis in 2-D)
     *
     * Returns { linear, angular }
     */
    compute(state, target) {
        var dx = target.x - state.x
        var dz = (target.z !== undefined ? target.z : target.y) - state.y
        var distance = Math.sqrt(dx * dx + dz * dz)

        // Desired heading towards target
        var desiredHeading = Math.atan2(dx, dz)
        var headingError = desiredHeading - state.theta
        // Normalize to [-PI, PI]
        while (headingError > Math.PI) headingError -= 2 * Math.PI
        while (headingError < -Math.PI) headingError += 2 * Math.PI

        // Linear velocity: proportional to distance, reduced when heading is off
        var desiredSpeed = Math.min(distance * 0.8, 2.0)
        var speedReduction = Math.max(0.2, 1 - Math.abs(headingError) / Math.PI)
        var linear = desiredSpeed * speedReduction

        // Angular velocity: PID-driven heading correction
        var angular = this.update(-headingError, 0)

        // Stop when close enough
        if (distance < 0.3) {
            linear = 0
            angular = 0
        }

        return { linear: linear, angular: angular }
    }

    reset() {
        this.integral = 0
        this.prevError = 0
        this.prevTime = Date.now()
    }
}

module.exports = PID
