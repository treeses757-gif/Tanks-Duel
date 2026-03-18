// ui.js
const menuDiv = document.getElementById('menu');
const roomPanel = document.getElementById('roomPanel');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const nicknameInput = document.getElementById('nicknameInput');
const playBtn = document.getElementById('playBtn');
const autoSearchBtn = document.getElementById('autoSearchBtn');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomStatus = document.getElementById('roomStatus');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const shopBtn = document.getElementById('shopBtn');
const tanksBtn = document.getElementById('tanksBtn');
const friendsBtn = document.getElementById('friendsBtn');

playBtn.addEventListener('click', () => {
    const nick = nicknameInput.value.trim();
    if (!nick) {
        alert('Введи ник!');
        return;
    }
    currentUser.name = nick;
    menuDiv.style.display = 'none';
    roomPanel.style.display = 'flex';
});

backToMenuBtn.addEventListener('click', () => {
    leaveRoom();
    roomPanel.style.display = 'none';
    menuDiv.style.display = 'flex';
    gameCanvas.classList.add('hidden');
    roomStatus.innerText = '';
});

createRoomBtn.addEventListener('click', async () => {
    if (!currentUser.name) return;
    try {
        const peerId = await initPeer();
        const code = await createRoom(peerId);
        roomStatus.innerText = `Комната создана. Код: ${code}. Ожидание игрока...`;
        listenRoom(code, {
            onGameStart: (data) => startGame(data),
            onWaiting: (data) => {},
            onClosed: () => leaveRoom()
        });
    } catch (e) {
        console.error(e);
        roomStatus.innerText = 'Ошибка создания комнаты';
    }
});

autoSearchBtn.addEventListener('click', async () => {
    if (!currentUser.name) return;
    try {
        const peerId = await initPeer();
        const code = await autoSearch(peerId);
        roomStatus.innerText = `Подключение к комнате ${code}...`;
        listenRoom(code, {
            onGameStart: (data) => startGame(data),
            onWaiting: (data) => roomStatus.innerText = `Ожидание игрока... Код: ${code}`,
            onClosed: () => leaveRoom()
        });
    } catch (e) {
        console.error(e);
        roomStatus.innerText = 'Ошибка поиска';
    }
});

joinRoomBtn.addEventListener('click', async () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code) return;
    if (!currentUser.name) return;
    try {
        const peerId = await initPeer();
        await joinRoom(code, peerId);
        roomStatus.innerText = `Подключение к комнате ${code}...`;
        listenRoom(code, {
            onGameStart: (data) => startGame(data),
            onWaiting: (data) => roomStatus.innerText = `Ожидание игрока... Код: ${code}`,
            onClosed: () => leaveRoom()
        });
    } catch (e) {
        roomStatus.innerText = e.message;
    }
});

shopBtn.addEventListener('click', () => alert('Магазин в разработке'));
tanksBtn.addEventListener('click', () => alert('Скины появятся скоро'));
friendsBtn.addEventListener('click', () => alert('Список друзей будет позже'));