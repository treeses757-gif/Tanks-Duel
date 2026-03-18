const TILE_SIZE = 40;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const maps = [
    [ // карта 0 (пустая комната без стен внутри)
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
];

class Tank {
    constructor(x, y, angle, peerId, name) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.peerId = peerId;
        this.name = name;
        this.speed = 2;
    }
}

let players = {};
let map = [];
let gameActive = false;

function loadMap(mapId) {
    map = maps[mapId].map(row => [...row]);
}

function canMove(x, y) {
    const left = Math.floor(x / TILE_SIZE);
    const right = Math.floor((x + TILE_SIZE - 1) / TILE_SIZE);
    const top = Math.floor(y / TILE_SIZE);
    const bottom = Math.floor((y + TILE_SIZE - 1) / TILE_SIZE);
    for (let i = left; i <= right; i++) {
        for (let j = top; j <= bottom; j++) {
            if (i < 0 || i >= MAP_WIDTH || j < 0 || j >= MAP_HEIGHT) return false;
            if (map[j][i] === 1) return false;
        }
    }
    return true;
}
