// script.js
let peer;
let conn;
let keys = {};

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function initPeer() {
    return new Promise((resolve, reject) => {
        if (peer) {
            resolve(peer.id);
            return;
        }
        peer = new Peer();
        peer.on('open', (id) => {
            console.log('PeerJS: открыт с id', id);
            resolve(id);
        });
        peer.on('error', (err) => {
            console.error('PeerJS ошибка:', err);
            setIndicator('error');
            reject(err);
        });
        peer.on('connection', (c) => {
            conn = c;
            setupConnection();
        });
    });
}

function setupConnection() {
    conn.on('data', (data) => {
        if (data.type === 'input') {
            if (currentUser.isHost) {
                handleRemoteInput(data);
            }
        } else if (data.type === 'gameState') {
            applyGameState(data.state);
        }
    });
    conn.on('close', () => {
        console.log('Соединение закрыто');
        setIndicator('idle');
    });
}

function startGame(roomData) {
    roomStatus.innerText = 'Игра начинается...';
    roomPanel.style.display = 'none';
    gameCanvas.classList.remove('hidden');
    gameActive = true;
    currentMapId = roomData.mapId;
    loadMap(currentMapId);
    
    const p1 = roomData.players[0];
    const p2 = roomData.players[1];
    players = {};
    players[p1.peerId] = new Tank(2 * TILE_SIZE, 7 * TILE_SIZE, 0, p1.peerId, p1.name);
    players[p2.peerId] = new Tank(17 * TILE_SIZE, 7 * TILE_SIZE, 180, p2.peerId, p2.name);
    
    if (!currentUser.isHost) {
        const hostPeerId = p1.peerId;
        conn = peer.connect(hostPeerId);
        setupConnection();
    } else {
        gameInterval = setInterval(updateGame, 50);
    }
}

function updateGame() {
    if (!gameActive) return;
    if (currentUser.isHost) {
        handleInput(currentUser.peerId);
        updateProjectiles();
        spawnBonuses();
        if (conn && conn.open) {
            conn.send({
                type: 'gameState',
                state: {
                    players: players,
                    projectiles: projectiles,
                    bonuses: bonuses,
                    mapId: currentMapId
                }
            });
        }
    }
    draw();
}

function handleInput(playerId) {
    const player = players[playerId];
    if (!player) return;
    let dx = 0, dy = 0;
    if (keys['KeyW']) dy = -player.speed;
    if (keys['KeyS']) dy = player.speed;
    if (keys['KeyA']) dx = -player.speed;
    if (keys['KeyD']) dx = player.speed;
    if (dx !== 0 || dy !== 0) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        if (canMove(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
        player.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }
    if (keys['Space']) {
        if (!player.shootCooldown || Date.now() > player.shootCooldown) {
            shoot(player);
            player.shootCooldown = Date.now() + 500;
        }
    }
}

function handleRemoteInput(data) {
    const player = players[data.peerId];
    if (!player) return;
    let dx = 0, dy = 0;
    if (data.keys.w) dy = -player.speed;
    if (data.keys.s) dy = player.speed;
    if (data.keys.a) dx = -player.speed;
    if (data.keys.d) dx = player.speed;
    if (dx !== 0 || dy !== 0) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        if (canMove(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }
        player.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }
    if (data.keys.space) {
        if (!player.shootCooldown || Date.now() > player.shootCooldown) {
            shoot(player);
            player.shootCooldown = Date.now() + 500;
        }
    }
}

function applyGameState(state) {
    players = state.players;
    projectiles = state.projectiles;
    bonuses = state.bonuses;
    currentMapId = state.mapId;
    loadMap(currentMapId);
    draw();
}

function draw() {
    ctx.clearRect(0, 0, 800, 600);
    // Карта
    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < MAP_WIDTH; col++) {
            if (map[row][col] === 1) {
                ctx.fillStyle = '#555';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1);
            } else {
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1);
            }
        }
    }
    // Бонусы
    bonuses.forEach(b => {
        ctx.fillStyle = b.type === 'speed' ? '#ffaa00' : '#00aaff';
        ctx.beginPath();
        ctx.arc(b.x + TILE_SIZE/2, b.y + TILE_SIZE/2, 15, 0, 2*Math.PI);
        ctx.fill();
    });
    // Танки
    for (let id in players) {
        const p = players[id];
        ctx.save();
        ctx.translate(p.x + TILE_SIZE/2, p.y + TILE_SIZE/2);
        ctx.rotate(p.angle * Math.PI/180);
        ctx.fillStyle = id === currentUser.peerId ? '#0f0' : '#f00';
        ctx.fillRect(-20, -15, 40, 30);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(15, -5, 20, 10);
        ctx.restore();
        ctx.fillStyle = '#0f0';
        ctx.fillRect(p.x, p.y-10, 40 * (p.health/100), 5);
        if (p.shield) {
            ctx.strokeStyle = '#00f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x + TILE_SIZE/2, p.y + TILE_SIZE/2, 25, 0, 2*Math.PI);
            ctx.stroke();
        }
    }
    // Снаряды
    ctx.fillStyle = '#ff0';
    projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2*Math.PI);
        ctx.fill();
    });
}

setInterval(() => {
    if (gameActive && !currentUser.isHost && conn && conn.open) {
        conn.send({
            type: 'input',
            peerId: currentUser.peerId,
            keys: {
                w: keys['KeyW'],
                a: keys['KeyA'],
                s: keys['KeyS'],
                d: keys['KeyD'],
                space: keys['Space']
            }
        });
    }
}, 50);
