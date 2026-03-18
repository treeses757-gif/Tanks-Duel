let keys = {};
let gameInterval = null;
let gameStateListener = null;
let playerInputsListener = null;
let clientInputInterval = null;

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function startGame(roomData) {
    console.log('🎮 startGame called', roomData);
    roomStatus.innerText = 'Игра начинается...';
    roomPanel.style.display = 'none';
    gameCanvas.classList.remove('hidden');
    gameActive = true;
    
    if (roomData.mapId === undefined) {
        console.error('mapId is undefined, using default 0');
        roomData.mapId = 0;
    }
    currentMapId = roomData.mapId;
    loadMap(currentMapId);
    
    const p1 = roomData.players[0];
    const p2 = roomData.players[1];
    players = {};
    players[p1.peerId] = new Tank(2 * TILE_SIZE, 7 * TILE_SIZE, 0, p1.peerId, p1.name);
    players[p2.peerId] = new Tank(17 * TILE_SIZE, 7 * TILE_SIZE, 180, p2.peerId, p2.name);
    console.log('👥 Игроки инициализированы:', players);
    
    // Отрисовываем сразу
    draw();
    
    if (currentUser.isHost) {
        console.log('👑 Я хост, запускаю игровой цикл');
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 50);
        
        if (playerInputsListener) playerInputsListener();
        playerInputsListener = listenPlayerInputs((inputs) => {
            console.log('👑 Хост получил вводы:', inputs);
            for (let peerId in inputs) {
                if (peerId !== currentUser.peerId) {
                    handleRemoteInput({
                        peerId: peerId,
                        keys: inputs[peerId]
                    });
                }
            }
        });
    } else {
        console.log('💻 Я клиент, слушаю gameState');
        if (gameStateListener) gameStateListener();
        gameStateListener = listenGameState((state) => {
            console.log('💻 Клиент получил состояние:', state);
            applyGameState(state);
        });
        
        if (clientInputInterval) clearInterval(clientInputInterval);
        clientInputInterval = setInterval(() => {
            if (gameActive) {
                const input = {
                    w: keys['KeyW'],
                    a: keys['KeyA'],
                    s: keys['KeyS'],
                    d: keys['KeyD'],
                    space: keys['Space']
                };
                // Отправляем только если есть нажатия (чтобы не спамить пустыми)
                if (input.w || input.a || input.s || input.d || input.space) {
                    console.log('📤 Клиент отправляет ввод:', input);
                    sendPlayerInput(input);
                }
            }
        }, 50);
    }
}

function updateGame() {
    if (!gameActive || !currentUser.isHost) return;
    
    handleInput(currentUser.peerId);
    updateProjectiles();
    spawnBonuses();
    
    const gameState = {
        players: players,
        projectiles: projectiles,
        bonuses: bonuses,
        mapId: currentMapId
    };
    updateGameState(gameState);
    
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
        console.log(`🚀 Хост пробует движение: текущие (${player.x},${player.y}) -> новые (${newX},${newY})`);
        if (canMove(newX, newY)) {
            player.x = newX;
            player.y = newY;
            console.log(`✅ Хост движется: новые координаты (${player.x},${player.y})`);
        } else {
            console.log('🧱 Хост упёрся в стену');
        }
        player.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }
    if (keys['Space']) {
        if (!player.shootCooldown || Date.now() > player.shootCooldown) {
            shoot(player);
            player.shootCooldown = Date.now() + 500;
            console.log('💥 Хост стреляет');
        }
    }
}

function handleRemoteInput(data) {
    console.log('🎮 Применяю удалённый ввод для', data.peerId, data.keys);
    const player = players[data.peerId];
    if (!player) {
        console.warn('⚠️ Игрок не найден:', data.peerId);
        return;
    }
    console.log(`Танк ${data.peerId} сейчас x=${player.x}, y=${player.y}`);
    let dx = 0, dy = 0;
    if (data.keys.w) dy = -player.speed;
    if (data.keys.s) dy = player.speed;
    if (data.keys.a) dx = -player.speed;
    if (data.keys.d) dx = player.speed;
    if (dx !== 0 || dy !== 0) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        console.log(`🚀 Удалённый игрок пробует движение: новые (${newX},${newY})`);
        // ВРЕМЕННО: раскомментируйте следующую строку, чтобы принудительно двигать без проверки стен
        // player.x = newX; player.y = newY; console.log('⚠️ Принудительное движение без проверки!');
        if (canMove(newX, newY)) {
            player.x = newX;
            player.y = newY;
            console.log(`✅ Удалённый игрок движется: новые координаты (${player.x},${player.y})`);
        } else {
            console.log('🧱 Удалённый игрок упёрся в стену');
        }
        player.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }
    if (data.keys.space) {
        if (!player.shootCooldown || Date.now() > player.shootCooldown) {
            shoot(player);
            player.shootCooldown = Date.now() + 500;
            console.log('💥 Удалённый игрок стреляет');
        }
    }
}

function applyGameState(state) {
    console.log('📦 applyGameState: получено состояние', state);
    players = state.players;
    projectiles = state.projectiles;
    bonuses = state.bonuses;
    currentMapId = state.mapId;
    loadMap(currentMapId);
    draw();
}

function draw() {
    if (!gameActive) return;
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
