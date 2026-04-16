const PID = require('../../algorithms/pid');
const astar = require('../../algorithms/astar');

class RobotController {
  constructor(state) {
    this.state = state;

    this.pid = new PID(1.0, 0.1, 0.05);
  }

  update() {
    // Step 1: Find path
    const path = astar(this.state);

    if (!path || path.length === 0) return;

    // Step 2: Take next point
    const target = path[0];

    // Step 3: Control movement
    const control = this.pid.compute(this.state, target);

    // Step 4: Apply movement
    this.state.velocity = control.linear;
    this.state.angularVelocity = control.angular;
  }
}

module.exports = RobotController;