// obstacleData.js
// Defines all obstacles in the environment
// Each obstacle has: position [x, y, z], size [width, height, depth], color, and type

const obstacleData = [
  {
    id: 'wall-1',
    type: 'wall',
    position: [5, 0.75, 0],
    size: [0.5, 1.5, 8],
    color: '#8B4513',
  },
  {
    id: 'wall-2',
    type: 'wall',
    position: [-5, 0.75, 0],
    size: [0.5, 1.5, 8],
    color: '#8B4513',
  },
  {
    id: 'wall-3',
    type: 'wall',
    position: [0, 0.75, 5],
    size: [10, 1.5, 0.5],
    color: '#8B4513',
  },
  {
    id: 'wall-4',
    type: 'wall',
    position: [0, 0.75, -5],
    size: [10, 1.5, 0.5],
    color: '#8B4513',
  },
  {
    id: 'box-1',
    type: 'box',
    position: [2, 0.5, 2],
    size: [1, 1, 1],
    color: '#e74c3c',
  },
  {
    id: 'box-2',
    type: 'box',
    position: [-2, 0.5, -1],
    size: [1.5, 1, 1.5],
    color: '#e67e22',
  },
  {
    id: 'box-3',
    type: 'box',
    position: [0, 0.5, -3],
    size: [1, 1, 1],
    color: '#e74c3c',
  },
  {
    id: 'cylinder-1',
    type: 'cylinder',
    position: [-3, 0.75, 3],
    radius: 0.5,
    height: 1.5,
    color: '#3498db',
  },
  {
    id: 'cylinder-2',
    type: 'cylinder',
    position: [3, 0.75, -2],
    radius: 0.7,
    height: 1.5,
    color: '#3498db',
  },
];

export default obstacleData;