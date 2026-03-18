const TILE_SIZE = 40;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const maps = [
    [ // карта 0
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [ // карта 1
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [ // карта 2
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [ // карта 3
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
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
        this.health = 100;
        this.shield = false;
        this.speed = 2;
        this.shootCooldown = 0;
    }
}

class Projectile {
    constructor(x, y, vx, vy, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
    }
}

class Bonus {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
}

let players = {};
let projectiles = [];
let bonuses = [];
let map = [];
let gameActive = false;

function loadMap(mapId) {
    if (!maps[mapId]) {
        console.error('Map not found:', mapId);
        return;
    }
    map = maps[mapId].map(row => [...row]);
    bonuses = [];
    console.log('Map loaded:', mapId);
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

function shoot(tank) {
    if (!tank) return;
    const angleRad = tank.angle * Math.PI / 180;
    projectiles.push(new Projectile(
        tank.x + TILE_SIZE/2,
        tank.y + TILE_SIZE/2,
        Math.cos(angleRad) * 5,
        Math.sin(angleRad) * 5,
        tank.peerId
    ));
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > MAP_WIDTH*TILE_SIZE || p.y < 0 || p.y > MAP_HEIGHT*TILE_SIZE) {
            projectiles.splice(i, 1);
            continue;
        }
        const cellX = Math.floor(p.x / TILE_SIZE);
        const cellY = Math.floor(p.y / TILE_SIZE);
        if (map[cellY] && map[cellY][cellX] === 1) {
            projectiles.splice(i, 1);
            continue;
        }
        for (let id in players) {
            if (id === p.owner) continue;
            const tank = players[id];
            if (p.x > tank.x && p.x < tank.x + TILE_SIZE &&
                p.y > tank.y && p.y < tank.y + TILE_SIZE) {
                if (!tank.shield) {
                    tank.health -= 25;
                    if (tank.health <= 0) {
                        gameActive = false;
                    }
                }
                projectiles.splice(i, 1);
                break;
            }
        }
    }
}

function spawnBonuses() {
    if (Math.random() < 0.005 && bonuses.length < 3) {
        let x, y;
        do {
            x = Math.floor(Math.random() * MAP_WIDTH);
            y = Math.floor(Math.random() * MAP_HEIGHT);
        } while (map[y][x] !== 0);
        const type = Math.random() < 0.5 ? 'speed' : 'shield';
        bonuses.push(new Bonus(x * TILE_SIZE, y * TILE_SIZE, type));
    }
    for (let i = bonuses.length - 1; i >= 0; i--) {
        const b = bonuses[i];
        for (let id in players) {
            const tank = players[id];
            if (tank.x < b.x + TILE_SIZE && tank.x + TILE_SIZE > b.x &&
                tank.y < b.y + TILE_SIZE && tank.y + TILE_SIZE > b.y) {
                if (b.type === 'speed') tank.speed = 4;
                else if (b.type === 'shield') tank.shield = true;
                setTimeout(() => {
                    if (b.type === 'speed') tank.speed = 2;
                    else tank.shield = false;
                }, 5000);
                bonuses.splice(i, 1);
            }
        }
    }
}
