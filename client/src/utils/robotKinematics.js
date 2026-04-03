export class DifferentialDriveKinematics {
  constructor(wheelRadius = 0.25, wheelBase = 1.4) {
    this.wheelRadius = wheelRadius
    this.wheelBase = wheelBase
    this.x = 0
    this.y = 0
    this.theta = 0
    this.leftWheelSpeed = 0
    this.rightWheelSpeed = 0
  }

  inverseKinematics(linearVel, angularVel) {
    this.rightWheelSpeed = (2 * linearVel + angularVel * this.wheelBase) / (2 * this.wheelRadius)
    this.leftWheelSpeed = (2 * linearVel - angularVel * this.wheelBase) / (2 * this.wheelRadius)
    return { left: this.leftWheelSpeed, right: this.rightWheelSpeed }
  }

  forwardKinematics(leftSpeed, rightSpeed) {
    var linearVel = this.wheelRadius * (rightSpeed + leftSpeed) / 2
    var angularVel = this.wheelRadius * (rightSpeed - leftSpeed) / this.wheelBase
    return { linearVel: linearVel, angularVel: angularVel }
  }

  reset() {
    this.x = 0
    this.y = 0
    this.theta = 0
    this.leftWheelSpeed = 0
    this.rightWheelSpeed = 0
  }
}