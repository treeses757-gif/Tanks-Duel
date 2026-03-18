// firebase.js
// Твой конфиг Firebase
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

// Переменные для текущей комнаты
let currentUser = {
    name: '',
    peerId: null,
    roomId: null,
    isHost: false
};
let roomListener = null;

// Функции для работы с комнатами
async function createRoom() {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const roomRef = db.collection('rooms').doc(code);
    const room = await roomRef.get();
    if (room.exists) return createRoom();
    
    await initPeer();
    const roomData = {
        players: [{
            name: currentUser.name,
            peerId: peer.id,
            tank: 0
        }],
        status: 'waiting',
        mapId: Math.floor(Math.random() * 4)
    };
    await roomRef.set(roomData);
    currentUser.roomId = code;
    currentUser.isHost = true;
    return code;
}

async function joinRoom(code) {
    const roomRef = db.collection('rooms').doc(code);
    const room = await roomRef.get();
    if (!room.exists) throw new Error('Комната не найдена');
    const data = room.data();
    if (data.status !== 'waiting' || data.players.length >= 2) {
        throw new Error('Комната уже заполнена или игра началась');
    }
    await initPeer();
    const updatedPlayers = [...data.players, {
        name: currentUser.name,
        peerId: peer.id,
        tank: 0
    }];
    await roomRef.update({
        players: updatedPlayers,
        status: 'playing'
    });
    currentUser.roomId = code;
    currentUser.isHost = false;
    return data;
}

async function autoSearch() {
    const snapshot = await db.collection('rooms')
        .where('status', '==', 'waiting')
        .get();
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.players.length === 1) {
            await joinRoom(doc.id);
            return doc.id;
        }
    }
    // Если нет свободных, создаём новую
    return await createRoom();
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