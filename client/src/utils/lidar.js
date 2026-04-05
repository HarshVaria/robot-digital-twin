export class LiDARSensor {
  constructor(config) {
    config = config || {}
    this.numRays = config.numRays || 180
    this.maxRange = config.maxRange || 10
    this.minRange = config.minRange || 0.15
    this.angularResolution = 360 / this.numRays
    this.noiseStdDev = config.noise || 0.02
    this.scanData = []
  }

  scan(robotPosition, robotRotation, obstacles) {
    this.scanData = []
    for (var i = 0; i < this.numRays; i++) {
      var localAngle = (i * this.angularResolution * Math.PI) / 180
      var worldAngle = localAngle + robotRotation
      var ray = this.castRay(robotPosition.x, robotPosition.z, worldAngle, obstacles)
      this.scanData.push({
        index: i,
        angle: i * this.angularResolution,
        angleRad: localAngle,
        distance: ray.distance,
        hit: ray.hit,
        point: ray.point
      })
    }
    return this.scanData
  }

  castRay(ox, oz, angle, obstacles) {
    var dx = Math.cos(angle)
    var dz = Math.sin(angle)
    var closest = this.maxRange
    var hit = false

    for (var i = 0; i < obstacles.length; i++) {
      var obs = obstacles[i]
      var d = this.rayBox(ox, oz, dx, dz, obs.position[0], obs.position[2], obs.size[0], obs.size[2])
      if (d !== null && d < closest && d > this.minRange) {
        closest = d
        hit = true
      }
    }

    var wd = this.checkWalls(ox, oz, dx, dz)
    if (wd !== null && wd < closest && wd > this.minRange) {
      closest = wd
      hit = true
    }

    if (hit) {
      closest += this.gaussNoise() * this.noiseStdDev
      closest = Math.max(this.minRange, closest)
    }

    return {
      distance: closest,
      hit: hit,
      point: { x: ox + dx * closest, z: oz + dz * closest }
    }
  }

  rayBox(ox, oz, dx, dz, bx, bz, bw, bh) {
    var hw = bw / 2
    var hh = bh / 2
    var tmin = -Infinity
    var tmax = Infinity

    if (Math.abs(dx) > 0.00000001) {
      var t1 = (bx - hw - ox) / dx
      var t2 = (bx + hw - ox) / dx
      tmin = Math.max(tmin, Math.min(t1, t2))
      tmax = Math.min(tmax, Math.max(t1, t2))
    } else if (ox < bx - hw || ox > bx + hw) {
      return null
    }

    if (Math.abs(dz) > 0.00000001) {
      var t3 = (bz - hh - oz) / dz
      var t4 = (bz + hh - oz) / dz
      tmin = Math.max(tmin, Math.min(t3, t4))
      tmax = Math.min(tmax, Math.max(t3, t4))
    } else if (oz < bz - hh || oz > bz + hh) {
      return null
    }

    if (tmax >= tmin && tmax > 0) {
      return tmin > 0 ? tmin : tmax
    }
    return null
  }

  checkWalls(ox, oz, dx, dz) {
    var b = 14.5
    var min = Infinity
    var walls = [
      { val: -b, dir: dz, orig: oz, cd: dx, co: ox },
      { val: b, dir: dz, orig: oz, cd: dx, co: ox },
      { val: -b, dir: dx, orig: ox, cd: dz, co: oz },
      { val: b, dir: dx, orig: ox, cd: dz, co: oz }
    ]
    for (var i = 0; i < walls.length; i++) {
      var w = walls[i]
      if (Math.abs(w.dir) > 0.00000001) {
        var t = (w.val - w.orig) / w.dir
        if (t > 0 && t < min) {
          var cp = w.co + w.cd * t
          if (cp >= -b && cp <= b) min = t
        }
      }
    }
    return min < Infinity ? min : null
  }

  gaussNoise() {
    var u = 0
    var v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}