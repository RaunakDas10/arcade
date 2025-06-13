import Phaser from 'phaser';
import Player from '../objects/Player';
import Weapon from '../objects/Weapon';
import Zone from '../objects/Zone';
import { distance, generateId } from '../utils/helpers';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.players = new Map();
        this.weapons = new Map();
        this.bullets = new Map();
        this.gameStarted = false;
        this.gameOver = false;
        
        // Map dimensions
        this.mapSize = 2000;
        
        // Player data
        this.playerId = generateId();
        this.playerName = '';
    }

    init() {
        // Get player name from registry
        this.playerName = this.registry.get('playerName') || 'Player';
        
        // Reset game state
        this.players.clear();
        this.weapons.clear();
        this.bullets.clear();
        this.gameStarted = false;
        this.gameOver = false;
    }

    create() {
        // Create world bounds
        this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize);
        
        // Create map background
        this.createMap();
        
        // Create player
        this.createPlayer();
        
        // Create AI players
        this.createAIPlayers();
        
        // Create weapons
        this.createWeapons();
        
        // Create zone
        this.zone = new Zone(this, this.mapSize / 2, this.mapSize / 2);
        
        // Set up camera
        this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize);
        this.cameras.main.startFollow(this.player.sprite);
        
        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // Set up shooting
        this.input.on('pointerdown', (pointer) => {
            if (this.player && !this.gameOver) {
                this.player.shoot(pointer);
            }
        });
        
        // Set up collision detection
        this.setupCollisions();
        
        // Start game
        this.startGame();
        
        // Play game music
        this.gameMusic = this.sound.add('game-music', { loop: true, volume: 0.3 });
        this.gameMusic.play();
        
        // Event emitter for UI updates
        this.events.emit('gameStarted', {
            playerId: this.playerId,
            playerName: this.playerName,
            totalPlayers: this.players.size
        });
    }

    createMap() {
        // Create a simple grid background
        const tileSize = 64;
        const numTiles = this.mapSize / tileSize;
        
        // Create a graphics object for the grid
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.8);
        
        // Draw horizontal lines
        for (let i = 0; i <= numTiles; i++) {
            graphics.moveTo(0, i * tileSize);
            graphics.lineTo(this.mapSize, i * tileSize);
        }
        
        // Draw vertical lines
        for (let i = 0; i <= numTiles; i++) {
            graphics.moveTo(i * tileSize, 0);
            graphics.lineTo(i * tileSize, this.mapSize);
        }
        
        graphics.strokePath();
        
        // Add some random obstacles
        this.obstacles = this.physics.add.staticGroup();
        
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(100, this.mapSize - 100);
            const y = Phaser.Math.Between(100, this.mapSize - 100);
            const size = Phaser.Math.Between(50, 150);
            
            // Create obstacle
            const obstacle = this.add.rectangle(x, y, size, size, 0x555555);
            this.obstacles.add(obstacle);
        }
    }

    createPlayer() {
        // Create player at random position
        const x = Phaser.Math.Between(100, this.mapSize - 100);
        const y = Phaser.Math.Between(100, this.mapSize - 100);
        
        // Create player object
        this.player = new Player(
            this,
            x,
            y,
            'player-blue',
            this.playerId,
            this.playerName,
            true
        );
        
        // Add to players map
        this.players.set(this.playerId, this.player);
        
        // Update UI with player count
        this.events.emit('playerCountUpdated', this.players.size);
    }

    createAIPlayers() {
        // Create AI players
        const colors = ['red', 'green', 'yellow'];
        const aiCount = 15; // 15 AI players for a total of 16 including the human player
        
        for (let i = 0; i < aiCount; i++) {
            // Generate random position away from player
            let x, y;
            do {
                x = Phaser.Math.Between(100, this.mapSize - 100);
                y = Phaser.Math.Between(100, this.mapSize - 100);
            } while (distance(x, y, this.player.sprite.x, this.player.sprite.y) < 300);
            
            // Create AI player
            const aiId = generateId();
            const aiName = `Bot${i + 1}`;
            const colorIndex = i % colors.length;
            
            const aiPlayer = new Player(
                this,
                x,
                y,
                `player-${colors[colorIndex]}`,
                aiId,
                aiName,
                false
            );
            
            // Add to players map
            this.players.set(aiId, aiPlayer);
        }
        
        // Update UI with player count
        this.events.emit('playerCountUpdated', this.players.size);
    }

    createWeapons() {
        // Create weapons scattered around the map
        const weaponTypes = ['pistol', 'rifle', 'shotgun'];
        const weaponCount = 30;
        
        for (let i = 0; i < weaponCount; i++) {
            // Generate random position
            const x = Phaser.Math.Between(100, this.mapSize - 100);
            const y = Phaser.Math.Between(100, this.mapSize - 100);
            
            // Select random weapon type
            const weaponType = weaponTypes[Phaser.Math.Between(0, weaponTypes.length - 1)];
            
            // Create weapon
            const weaponId = generateId();
            const weapon = new Weapon(this, x, y, weaponType, weaponId);
            
            // Add to weapons map
            this.weapons.set(weaponId, weapon);
        }
    }

    setupCollisions() {
        // Player-obstacle collisions
        this.physics.add.collider(this.player.sprite, this.obstacles);
        
        // Player-weapon collisions
        this.physics.add.overlap(
            this.player.sprite,
            Array.from(this.weapons.values()).map(weapon => weapon.sprite),
            this.handleWeaponPickup.bind(this)
        );
        
        // Player-player collisions
        this.physics.add.collider(
            this.player.sprite,
            Array.from(this.players.values())
                .filter(p => p.id !== this.playerId)
                .map(p => p.sprite)
        );
        
        // Bullet-player collisions
        this.physics.add.overlap(
            Array.from(this.players.values()).map(p => p.sprite),
            this.bullets,
            this.handleBulletHit.bind(this)
        );
        
        // Bullet-obstacle collisions
        this.physics.add.overlap(
            this.bullets,
            this.obstacles,
            this.handleBulletObstacleHit.bind(this)
        );
    }

    handleWeaponPickup(playerSprite, weaponSprite) {
        // Find the weapon
        const weapon = Array.from(this.weapons.values()).find(w => w.sprite === weaponSprite);
        
        if (weapon) {
            // Give weapon to player
            this.player.equipWeapon(weapon.type);
            
            // Play pickup sound
            this.sound.play('pickup');
            
            // Remove weapon from map
            this.weapons.delete(weapon.id);
            weapon.sprite.destroy();
            
            // Update UI
            this.events.emit('weaponPickup', weapon.type);
        }
    }

    handleBulletHit(playerSprite, bulletSprite) {
        // Find the player and bullet
        const player = Array.from(this.players.values()).find(p => p.sprite === playerSprite);
        const bullet = Array.from(this.bullets.values()).find(b => b.sprite === bulletSprite);
        
        if (player && bullet && bullet.playerId !== player.id) {
            // Damage player
            player.takeDamage(bullet.damage);
            
            // Play hit sound
            this.sound.play('hit');
            
            // Remove bullet
            this.bullets.delete(bullet.id);
            bullet.sprite.destroy();
            
            // Check if player died
            if (player.health <= 0) {
                this.handlePlayerDeath(player);
            }
            
            // Update UI if it's the main player
            if (player.id === this.playerId) {
                this.events.emit('playerDamaged', player.health);
            }
        }
    }

    handleBulletObstacleHit(bulletSprite, obstacleSprite) {
        // Find the bullet
        const bullet = Array.from(this.bullets.values()).find(b => b.sprite === bulletSprite);
        
        if (bullet) {
            // Remove bullet
            this.bullets.delete(bullet.id);
            bullet.sprite.destroy();
        }
    }

    handlePlayerDeath(player) {
        // Remove player
        if (player.sprite) {
            player.sprite.destroy();
        }
        
        this.players.delete(player.id);
        
        // Update UI
        this.events.emit('playerCountUpdated', this.players.size);
        
        // Check if it's the main player
        if (player.id === this.playerId) {
            this.handleGameOver(false);
        }
        
        // Check if game is over (only one player left)
        if (this.players.size === 1 && this.players.has(this.playerId)) {
            this.handleGameOver(true);
        }
    }

    startGame() {
        this.gameStarted = true;
        
        // Start zone shrinking
        this.zone.startShrinking();
        
        // Start AI behavior
        this.aiUpdateInterval = setInterval(() => {
            this.updateAI();
        }, 500);
    }

    updateAI() {
        // Update AI players
        Array.from(this.players.values()).forEach(player => {
            if (!player.isHuman && player.health > 0) {
                // Move towards safe zone if outside
                if (!this.zone.isInSafeZone(player.sprite.x, player.sprite.y)) {
                    const angle = Phaser.Math.Angle.Between(
                        player.sprite.x,
                        player.sprite.y,
                        this.zone.x,
                        this.zone.y
                    );
                    
                    player.moveInDirection(angle);
                } else {
                    // Random movement or target nearest player
                    if (Phaser.Math.Between(0, 10) > 7) {
                        // Find nearest player
                        let nearestPlayer = null;
                        let nearestDistance = Infinity;
                        
                        Array.from(this.players.values()).forEach(otherPlayer => {
                            if (otherPlayer.id !== player.id) {
                                const dist = distance(
                                    player.sprite.x,
                                    player.sprite.y,
                                    otherPlayer.sprite.x,
                                    otherPlayer.sprite.y
                                );
                                
                                if (dist < nearestDistance) {
                                    nearestDistance = dist;
                                    nearestPlayer = otherPlayer;
                                }
                            }
                        });
                        
                        if (nearestPlayer && nearestDistance < 300) {
                            // Move towards and shoot at nearest player
                            const angle = Phaser.Math.Angle.Between(
                                player.sprite.x,
                                player.sprite.y,
                                nearestPlayer.sprite.x,
                                nearestPlayer.sprite.y
                            );
                            
                            player.moveInDirection(angle);
                            
                            // Shoot occasionally
                            if (Phaser.Math.Between(0, 10) > 7) {
                                player.shootInDirection(angle);
                            }
                        } else {
                            // Random movement
                            const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                            player.moveInDirection(randomAngle);
                        }
                    }
                }
                
                // Pick up weapons if nearby
                Array.from(this.weapons.values()).forEach(weapon => {
                    const dist = distance(
                        player.sprite.x,
                        player.sprite.y,
                        weapon.sprite.x,
                        weapon.sprite.y
                    );
                    
                    if (dist < 50) {
                        player.equipWeapon(weapon.type);
                        this.weapons.delete(weapon.id);
                        weapon.sprite.destroy();
                    }
                });
            }
        });
    }

    handleGameOver(isWinner) {
        if (!this.gameOver) {
            this.gameOver = true;
            
            // Stop AI updates
            if (this.aiUpdateInterval) {
                clearInterval(this.aiUpdateInterval);
            }
            
            // Stop zone shrinking
            this.zone.stopShrinking();
            
            // Stop game music
            if (this.gameMusic) {
                this.gameMusic.stop();
            }
            
            // Show game over screen
            this.scene.launch('GameOverScene', { isWinner });
            
            // Emit game over event
            this.events.emit('gameOver', { isWinner });
        }
    }

    update(time, delta) {
        if (!this.gameStarted || this.gameOver) return;
        
        // Update player
        if (this.player && this.player.health > 0) {
            // Handle player movement
            const left = this.cursors.left.isDown || this.wasd.left.isDown;
            const right = this.cursors.right.isDown || this.wasd.right.isDown;
            const up = this.cursors.up.isDown || this.wasd.up.isDown;
            const down = this.cursors.down.isDown || this.wasd.down.isDown;
            
            // Calculate movement direction
            let dx = 0;
            let dy = 0;
            
            if (left) dx -= 1;
            if (right) dx += 1;
            if (up) dy -= 1;
            if (down) dy += 1;
            
            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0) {
                dx *= 0.7071; // 1/sqrt(2)
                dy *= 0.7071;
            }
            
            // Move player
            this.player.move(dx, dy);
            
            // Rotate player towards mouse
            const pointer = this.input.activePointer;
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            
            if (worldPoint) {
                const angle = Phaser.Math.Angle.Between(
                    this.player.sprite.x,
                    this.player.sprite.y,
                    worldPoint.x,
                    worldPoint.y
                );
                
                this.player.rotate(angle);
            }
            
            // Check if player is outside safe zone
            if (!this.zone.isInSafeZone(this.player.sprite.x, this.player.sprite.y)) {
                this.player.takeDamage(0.1);
                this.events.emit('playerDamaged', this.player.health);
                
                if (this.player.health <= 0) {
                    this.handlePlayerDeath(this.player);
                }
            }
        }
        
        // Update zone
        this.zone.update(time, delta);
        
        // Update bullets
        Array.from(this.bullets.values()).forEach(bullet => {
            bullet.update(delta);
        });
        
        // Update UI
        this.events.emit('zoneUpdate', {
            currentRadius: this.zone.currentRadius,
            targetRadius: this.zone.targetRadius,
            shrinkTime: this.zone.shrinkTime,
            playerInZone: this.zone.isInSafeZone(this.player.sprite.x, this.player.sprite.y)
        });
    }
}

export default GameScene;
