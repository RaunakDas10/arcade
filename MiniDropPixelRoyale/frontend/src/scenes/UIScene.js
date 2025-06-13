import Phaser from 'phaser';
import { formatTime, isMobileDevice } from '../utils/helpers';

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        
        // UI state
        this.playerCount = 0;
        this.playerHealth = 100;
        this.currentWeapon = 'pistol';
        this.matchTime = 0;
        this.zoneInfo = null;
    }

    create() {
        // Get game scene
        this.gameScene = this.scene.get('GameScene');
        
        // Create UI elements
        this.createPlayerInfo();
        this.createWeaponInfo();
        this.createMatchInfo();
        this.createMobileControls();
        
        // Listen for game events
        this.setupEventListeners();
    }

    createPlayerInfo() {
        // Player health bar background
        this.add.rectangle(20, 20, 210, 30, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);
        
        // Player health bar
        this.healthBar = this.add.rectangle(25, 25, 200, 20, 0x00ff00)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);
        
        // Player health text
        this.healthText = this.add.text(125, 35, '100 HP', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100);
    }

    createWeaponInfo() {
        // Weapon info background
        this.add.rectangle(20, 60, 210, 40, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);
        
        // Weapon icon
        this.weaponIcon = this.add.image(40, 80, 'weapon-pistol')
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100)
            .setScale(0.8);
        
        // Weapon name
        this.weaponText = this.add.text(70, 80, 'Pistol', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(100);
    }

    createMatchInfo() {
        // Match info background
        this.add.rectangle(this.cameras.main.width - 230, 20, 210, 70, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);
        
        // Players alive
        this.playersText = this.add.text(this.cameras.main.width - 220, 30, 'Players: 0', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        })
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);
        
        // Match time
        this.timeText = this.add.text(this.cameras.main.width - 220, 55, 'Time: 00:00', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        })
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);
        
        // Zone info
        this.zoneText = this.add.text(this.cameras.main.width / 2, 30, 'Zone: Stable', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(100);
    }

    createMobileControls() {
        // Only create mobile controls if on a mobile device
        if (!isMobileDevice()) return;
        
        // Movement joystick
        this.joystickBase = this.add.image(100, this.cameras.main.height - 100, 'joystick-base')
            .setScrollFactor(0)
            .setDepth(100)
            .setAlpha(0.7)
            .setScale(1.5);
        
        this.joystick = this.add.image(100, this.cameras.main.height - 100, 'joystick')
            .setScrollFactor(0)
            .setDepth(101)
            .setAlpha(0.8)
            .setScale(0.8);
        
        // Shoot button
        this.shootButton = this.add.circle(
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            40,
            0xff0000,
            0.8
        )
            .setScrollFactor(0)
            .setDepth(100)
            .setInteractive();
        
        this.add.text(
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            'FIRE',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        
        // Set up joystick input
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x < this.cameras.main.width / 2) {
                this.joystickActive = true;
                this.joystickPointer = pointer;
                this.updateJoystick(pointer);
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.joystickActive && this.joystickPointer.id === pointer.id) {
                this.updateJoystick(pointer);
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.joystickActive && this.joystickPointer.id === pointer.id) {
                this.joystickActive = false;
                this.joystick.setPosition(this.joystickBase.x, this.joystickBase.y);
                
                // Reset player movement
                if (this.gameScene.player) {
                    this.gameScene.player.move(0, 0);
                }
            }
        });
        
        // Set up shoot button
        this.shootButton.on('pointerdown', () => {
            if (this.gameScene.player) {
                // Shoot towards the current rotation
                const angle = this.gameScene.player.sprite.rotation;
                const pointer = {
                    x: this.cameras.main.width / 2 + Math.cos(angle) * 100,
                    y: this.cameras.main.height / 2 + Math.sin(angle) * 100
                };
                
                this.gameScene.player.shoot(pointer);
            }
        });
    }

    updateJoystick(pointer) {
        // Calculate joystick position
        const baseX = this.joystickBase.x;
        const baseY = this.joystickBase.y;
        const maxDistance = 50;
        
        let dx = pointer.x - baseX;
        let dy = pointer.y - baseY;
        
        // Limit distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) {
            dx = (dx / distance) * maxDistance;
            dy = (dy / distance) * maxDistance;
        }
        
        // Update joystick position
        this.joystick.setPosition(baseX + dx, baseY + dy);
        
        // Update player movement
        if (this.gameScene.player) {
            // Normalize input
            const normalizedX = dx / maxDistance;
            const normalizedY = dy / maxDistance;
            
            this.gameScene.player.move(normalizedX, normalizedY);
        }
    }

    setupEventListeners() {
        // Listen for player count updates
        this.gameScene.events.on('playerCountUpdated', (count) => {
            this.playerCount = count;
            this.playersText.setText(`Players: ${count}`);
        });
        
        // Listen for player damage
        this.gameScene.events.on('playerDamaged', (health) => {
            this.playerHealth = health;
            this.updateHealthBar();
        });
        
        // Listen for weapon pickup
        this.gameScene.events.on('weaponPickup', (weaponType) => {
            this.currentWeapon = weaponType;
            this.updateWeaponInfo();
        });
        
        // Listen for zone updates
        this.gameScene.events.on('zoneUpdate', (zoneInfo) => {
            this.zoneInfo = zoneInfo;
            this.updateZoneInfo();
        });
        
        // Listen for game over
        this.gameScene.events.on('gameOver', () => {
            // Hide mobile controls if they exist
            if (this.joystickBase) this.joystickBase.setVisible(false);
            if (this.joystick) this.joystick.setVisible(false);
            if (this.shootButton) this.shootButton.setVisible(false);
        });
    }

    updateHealthBar() {
        // Update health bar width
        const width = 200 * (this.playerHealth / 100);
        this.healthBar.width = width;
        
        // Update health bar color
        let color;
        if (this.playerHealth > 70) {
            color = 0x00ff00; // Green
        } else if (this.playerHealth > 30) {
            color = 0xffff00; // Yellow
        } else {
            color = 0xff0000; // Red
        }
        
        this.healthBar.fillColor = color;
        
        // Update health text
        this.healthText.setText(`${Math.ceil(this.playerHealth)} HP`);
    }

    updateWeaponInfo() {
        // Update weapon icon
        this.weaponIcon.setTexture(`weapon-${this.currentWeapon}`);
        
        // Update weapon name
        let weaponName;
        switch (this.currentWeapon) {
            case 'pistol':
                weaponName = 'Pistol';
                break;
            case 'rifle':
                weaponName = 'Rifle';
                break;
            case 'shotgun':
                weaponName = 'Shotgun';
                break;
            default:
                weaponName = 'Unknown';
        }
        
        this.weaponText.setText(weaponName);
    }

    updateZoneInfo() {
        if (!this.zoneInfo) return;
        
        // Update zone text
        if (this.zoneInfo.currentRadius === this.zoneInfo.targetRadius) {
            // Zone is stable
            this.zoneText.setText('Zone: Stable');
            this.zoneText.setColor('#ffffff');
        } else {
            // Zone is shrinking
            const timeLeft = Math.ceil((this.zoneInfo.targetRadius - this.zoneInfo.currentRadius) / 0.1);
            this.zoneText.setText(`Zone: Shrinking (${timeLeft}s)`);
            
            // Flash text if player is outside zone
            if (!this.zoneInfo.playerInZone) {
                this.zoneText.setColor('#ff0000');
                
                // Flash effect
                if (!this.zoneFlashTween) {
                    this.zoneFlashTween = this.tweens.add({
                        targets: this.zoneText,
                        alpha: { from: 1, to: 0.5 },
                        duration: 500,
                        yoyo: true,
                        repeat: -1
                    });
                }
            } else {
                this.zoneText.setColor('#ffff00');
                
                // Stop flash effect
                if (this.zoneFlashTween) {
                    this.zoneFlashTween.stop();
                    this.zoneFlashTween = null;
                    this.zoneText.alpha = 1;
                }
            }
        }
    }

    update(time, delta) {
        // Update match time
        this.matchTime += delta;
        this.timeText.setText(`Time: ${formatTime(this.matchTime / 1000)}`);
    }
}

export default UIScene;
