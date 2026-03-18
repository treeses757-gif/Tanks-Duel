

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
