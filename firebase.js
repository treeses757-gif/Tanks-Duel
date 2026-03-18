// firebase.js
const firebaseConfig = {
    apiKey: "AIzaSyC-iLxizH1umfeHSUZHLvpAt6XNm21p90Y",
    authDomain: "tanksduel-b90c7.firebaseapp.com",
    projectId: "tanksduel-b90c7",
    storageBucket: "tanksduel-b90c7.firebasestorage.app",
    messagingSenderId: "952596856224",
    appId: "1:952596856224:web:aefd98cf1d768e9169f8c5",
    measurementId: "G-F5RZGHPC3Q"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = {
    name: '',
    peerId: null,
    roomId: null,
    isHost: false
};
let roomListener = null;

async function createRoom(peerId) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const roomRef = db.collection('rooms').doc(code);
    const room = await roomRef.get();
    if (room.exists) return createRoom(peerId);
    
    const roomData = {
        players: [{
            name: currentUser.name,
            peerId: peerId,
            tank: 0
        }],
        status: 'waiting',
        mapId: Math.floor(Math.random() * 4),
        gameState: null,
        playerInputs: {}
    };
    await roomRef.set(roomData);
    currentUser.roomId = code;
    currentUser.isHost = true;
    currentUser.peerId = peerId;
    return code;
}

async function joinRoom(code, peerId) {
    const roomRef = db.collection('rooms').doc(code);
    const room = await roomRef.get();
    if (!room.exists) throw new Error('Комната не найдена');
    const data = room.data();
    if (data.status !== 'waiting' || data.players.length >= 2) {
        throw new Error('Комната уже заполнена или игра началась');
    }
    const updatedPlayers = [...data.players, {
        name: currentUser.name,
        peerId: peerId,
        tank: 0
    }];
    await roomRef.update({
        players: updatedPlayers,
        status: 'playing',
        gameState: null,
        playerInputs: {}
    });
    currentUser.roomId = code;
    currentUser.isHost = false;
    currentUser.peerId = peerId;
    return data;
}

async function autoSearch(peerId) {
    const snapshot = await db.collection('rooms')
        .where('status', '==', 'waiting')
        .get();
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.players.length === 1) {
            await joinRoom(doc.id, peerId);
            return doc.id;
        }
    }
    return await createRoom(peerId);
}

function listenRoom(roomId, callbacks) {
    if (roomListener) roomListener();
    roomListener = db.collection('rooms').doc(roomId)
        .onSnapshot((doc) => {
            if (!doc.exists) {
                callbacks.onClosed();
                return;
            }
            const data = doc.data();
            if (data.status === 'playing' && data.players.length === 2) {
                callbacks.onGameStart(data);
            } else if (data.status === 'waiting' && data.players.length === 1) {
                callbacks.onWaiting(data);
            }
        });
}

function leaveRoom() {
    if (roomListener) {
        roomListener();
        roomListener = null;
    }
    if (currentUser.roomId) {
        db.collection('rooms').doc(currentUser.roomId).delete().catch(() => {});
        currentUser.roomId = null;
    }
}

// ---- Дополнительные функции для игрового процесса ----

function getGameRoomRef() {
    if (!currentUser.roomId) return null;
    return db.collection('rooms').doc(currentUser.roomId);
}

// Хост обновляет состояние игры
async function updateGameState(gameState) {
    const ref = getGameRoomRef();
    if (!ref) return;
    await ref.update({
        gameState: gameState,
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Клиент слушает изменения состояния
function listenGameState(callback) {
    const ref = getGameRoomRef();
    if (!ref) return null;
    return ref.onSnapshot((doc) => {
        const data = doc.data();
        if (data && data.gameState) {
            callback(data.gameState);
        }
    });
}

// Клиент отправляет свой ввод
async function sendPlayerInput(inputData) {
    const ref = getGameRoomRef();
    if (!ref) return;
    // Используем update с динамическим ключом
    await ref.update({
        [`playerInputs.${currentUser.peerId}`]: inputData
    });
}

// Хост слушает ввод игроков
function listenPlayerInputs(callback) {
    const ref = getGameRoomRef();
    if (!ref) return null;
    return ref.onSnapshot((doc) => {
        const data = doc.data();
        if (data && data.playerInputs) {
            callback(data.playerInputs);
        }
    });
}
