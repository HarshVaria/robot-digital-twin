class RobotState {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.theta = 0; // orientation

    this.velocity = 0;
    this.angularVelocity = 0;

    this.target = { x: 10, y: 10 };

    this.sensorData = {
      lidar: [],
      imu: {},
      encoder: {}
    };
  }
}

module.exports = RobotState;