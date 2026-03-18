const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');
const logDiv = document.getElementById('log');

let keys = {};
let gameInterval = null;
let gameStateListener = null;
let playerInputsListener = null;
let clientInputInterval = null;

// Поддержка мобильных кнопок
document.querySelectorAll('.ctrl-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        keys['Key' + key.toUpperCase()] = true;
        console.log(`Кнопка ${key} нажата (touch)`);
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        keys['Key' + key.toUpperCase()] = false;
        console.log(`Кнопка ${key} отпущена (touch)`);
    });
    // Для мыши (на случай теста на ПК)
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        keys['Key' + key.toUpperCase()] = true;
        console.log(`Кнопка ${key} нажата (mouse)`);
    });
    btn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        keys['Key' + key.toUpperCase()] = false;
        console.log(`Кнопка ${key} отпущена (mouse)`);
    });
});

// Клавиатура (для ПК)
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    console.log(`Key down: ${e.code}`);
});
window.addEventListener('keyup', e => {
    keys[e.code] = false;
    console.log(`Key up: ${e.code}`);
});

function log(msg) {
    console.log(msg);
    logDiv.innerText += msg + '\n';
    logDiv.scrollTop = logDiv.scrollHeight;
}

function startGame(roomData) {
    log('🎮 Игра начинается... Роль: ' + (currentUser.isHost ? 'ХОСТ' : 'КЛИЕНТ'));
    document.getElementById('panel').style.display = 'none';
    canvas.style.display = 'block';
    gameActive = true;
    
    currentMapId = roomData.mapId || 0;
    loadMap(currentMapId);
    
    const p1 = roomData.players[0];
    const p2 = roomData.players[1];
    players = {};
    players[p1.peerId] = new Tank(2 * TILE_SIZE, 7 * TILE_SIZE, 0, p1.peerId, p1.name);
    players[p2.peerId] = new Tank(17 * TILE_SIZE, 7 * TILE_SIZE, 180, p2.peerId, p2.name);
    log('👥 Игроки: ' + Object.keys(players).join(', '));
    
    draw();
    
    if (currentUser.isHost) {
        gameInterval = setInterval(updateGame, 50);
        
        playerInputsListener = listenPlayerInputs((inputs) => {
            log('📥 Хост получил вводы: ' + JSON.stringify(inputs));
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
        gameStateListener = listenGameState((state) => {
            log('📦 Клиент получил состояние: ' + JSON.stringify(state).substring(0, 100));
            applyGameState(state);
            draw();
        });
        
        clientInputInterval = setInterval(() => {
            if (gameActive) {
                const input = {
                    w: keys['KeyW'] || false,
                    a: keys['KeyA'] || false,
                    s: keys['KeyS'] || false,
                    d: keys['KeyD'] || false,
                    space: false
                };
                // Отправляем всегда, даже если нет нажатий (для отладки)
                sendPlayerInput(input);
                if (input.w || input.a || input.s || input.d) {
                    log('📤 Клиент отправляет ввод: ' + JSON.stringify(input));
                }
            }
        }, 50);
    }
}

function updateGame() {
    if (!gameActive || !currentUser.isHost) return;
    
    handleInput(currentUser.peerId);
    
    const gameState = {
        players: players,
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
        if (canMove(newX, newY)) {
            player.x = newX;
            player.y = newY;
            log(`🚀 Хост движется: x=${player.x}, y=${player.y}`);
        }
        player.angle = Math.atan2(dy, dx) * 180 / Math.PI;
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
            log(`🚀 Удалённый игрок движется: x=${player.x}, y=${player.y}`);
        }
        player.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }
}

function applyGameState(state) {
    players = state.players;
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
    }
}

// --- Инициализация UI ---
document.getElementById('createRoom').onclick = async () => {
    const nick = document.getElementById('nickname').value.trim() || 'Anon';
    currentUser.name = nick;
    try {
        const peerId = 'player_' + Math.random().toString(36).substr(2, 9);
        const code = await createRoom(peerId);
        statusDiv.innerText = 'Комната создана. Код: ' + code;
        listenRoom(code, {
            onGameStart: (data) => startGame(data),
            onWaiting: () => log('Ожидание второго игрока...'),
            onClosed: () => log('Комната закрыта')
        });
    } catch (e) { log('Ошибка: ' + e.message); }
};

document.getElementById('autoJoin').onclick = async () => {
    const nick = document.getElementById('nickname').value.trim() || 'Anon';
    currentUser.name = nick;
    try {
        const peerId = 'player_' + Math.random().toString(36).substr(2, 9);
        const code = await autoSearch(peerId);
        statusDiv.innerText = 'Подключение к комнате ' + code;
        listenRoom(code, {
            onGameStart: (data) => startGame(data),
            onWaiting: () => log('Ожидание второго игрока...'),
            onClosed: () => log('Комната закрыта')
        });
    } catch (e) { log('Ошибка: ' + e.message); }
};

document.getElementById('joinRoom').onclick = async () => {
    const nick = document.getElementById('nickname').value.trim() || 'Anon';
    const code = document.getElementById('roomCode').value.trim().toUpperCase();
    if (!code) return;
    currentUser.name = nick;
    try {
        const peerId = 'player_' + Math.random().toString(36).substr(2, 9);
        await joinRoom(code, peerId);
        statusDiv.innerText = 'Подключение к комнате ' + code;
        listenRoom(code, {
            onGameStart: (data) => startGame(data),
            onWaiting: () => log('Ожидание второго игрока...'),
            onClosed: () => log('Комната закрыта')
        });
    } catch (e) { log('Ошибка: ' + e.message); }
};
