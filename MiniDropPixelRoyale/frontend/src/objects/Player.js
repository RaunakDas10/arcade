import Phaser from 'phaser';
import Bullet from './Bullet';
import { generateId } from '../utils/helpers';

class Player {
    constructor(scene, x, y, texture, id, name, isHuman = false) {
        this.scene = scene;
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
        this.health = 100;
        this.speed = 200;
        this.weaponType = 'pistol'; // Default weapon
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);
        
        // Set up physics body
        this.sprite.body.setSize(32, 32);
        
        // Add name text
        this.nameText = scene.add.text(x, y - 40, name, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.nameText.setOrigin(0.5);
        this.nameText.setDepth(11);
        
        // Add health bar
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(11);
        this.updateHealthBar();
        
        // Weapon properties
        this.weaponConfig = {
            pistol: {
                damage: 10,
                fireRate: 400,
                bulletSpeed: 500,
                bulletLifespan: 1000
            },
            rifle: {
                damage: 15,
                fireRate: 200,
                bulletSpeed: 700,
                bulletLifespan: 1500
            },
            shotgun: {
                damage: 8,
                fireRate: 800,
                bulletSpeed: 600,
                bulletLifespan: 800,
                bulletCount: 5,
                spread: 0.3
            }
        };
        
        // Shooting cooldown
        this.lastFireTime = 0;
    }
    
    move(dx, dy) {
        if (this.health <= 0) return;
        
        // Apply velocity
        this.sprite.setVelocity(dx * this.speed, dy * this.speed);
        
        // Update name text and health bar position
        this.nameText.setPosition(this.sprite.x, this.sprite.y - 40);
        this.updateHealthBar();
    }
    
    moveInDirection(angle) {
        if (this.health <= 0) return;
        
        // Calculate velocity components
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Apply velocity
        this.sprite.setVelocity(dx * this.speed, dy * this.speed);
        
        // Rotate sprite
        this.rotate(angle);
        
        // Update name text and health bar position
        this.nameText.setPosition(this.sprite.x, this.sprite.y - 40);
        this.updateHealthBar();
    }
    
    rotate(angle) {
        if (this.health <= 0) return;
        
        // Rotate sprite
        this.sprite.rotation = angle;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Clamp health to 0-100
        this.health = Math.max(0, Math.min(100, this.health));
        
        // Update health bar
        this.updateHealthBar();
        
        // Flash sprite when hit
        if (amount > 0) {
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true
            });
        }
    }
    
    updateHealthBar() {
        // Clear previous health bar
        this.healthBar.clear();
        
        // Draw background
        this.healthBar.fillStyle(0x000000, 0.8);
        this.healthBar.fillRect(this.sprite.x - 25, this.sprite.y - 30, 50, 6);
        
        // Draw health (green to red based on health percentage)
        const healthPercent = this.health / 100;
        const color = Phaser.Display.Color.GetColor(
            255 * (1 - healthPercent),
            255 * healthPercent,
            0
        );
        
        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRect(this.sprite.x - 25, this.sprite.y - 30, 50 * healthPercent, 6);
    }
    
    equipWeapon(type) {
        if (this.weaponConfig[type]) {
            this.weaponType = type;
        }
    }
    
    shoot(pointer) {
        if (this.health <= 0) return;
        
        const currentTime = this.scene.time.now;
        const weaponData = this.weaponConfig[this.weaponType];
        
        // Check cooldown
        if (currentTime - this.lastFireTime < weaponData.fireRate) {
            return;
        }
        
        // Update last fire time
        this.lastFireTime = currentTime;
        
        // Get world point for mouse position
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            worldPoint.x,
            worldPoint.y
        );
        
        // Create bullets
        this.createBullets(angle, weaponData);
        
        // Play shoot sound
        this.scene.sound.play('shoot');
    }
    
    shootInDirection(angle) {
        if (this.health <= 0) return;
        
        const currentTime = this.scene.time.now;
        const weaponData = this.weaponConfig[this.weaponType];
        
        // Check cooldown
        if (currentTime - this.lastFireTime < weaponData.fireRate) {
            return;
        }
        
        // Update last fire time
        this.lastFireTime = currentTime;
        
        // Create bullets
        this.createBullets(angle, weaponData);
        
        // Play shoot sound
        this.scene.sound.play('shoot');
    }
    
    createBullets(angle, weaponData) {
        // For shotgun, create multiple bullets with spread
        if (this.weaponType === 'shotgun') {
            const bulletCount = weaponData.bulletCount || 1;
            const spread = weaponData.spread || 0;
            
            for (let i = 0; i < bulletCount; i++) {
                // Calculate spread angle
                const spreadAngle = angle + (Math.random() * spread * 2 - spread);
                
                // Create bullet
                this.createBullet(spreadAngle, weaponData);
            }
        } else {
            // Create single bullet
            this.createBullet(angle, weaponData);
        }
    }
    
    createBullet(angle, weaponData) {
        // Calculate spawn position (slightly in front of player)
        const spawnDistance = 30;
        const x = this.sprite.x + Math.cos(angle) * spawnDistance;
        const y = this.sprite.y + Math.sin(angle) * spawnDistance;
        
        // Create bullet
        const bulletId = generateId();
        const bullet = new Bullet(
            this.scene,
            x,
            y,
            angle,
            this.id,
            bulletId,
            weaponData.damage,
            weaponData.bulletSpeed,
            weaponData.bulletLifespan
        );
        
        // Add to bullets map
        this.scene.bullets.set(bulletId, bullet);
    }
    
    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.nameText) this.nameText.destroy();
        if (this.healthBar) this.healthBar.destroy();
    }
}

export default Player;
