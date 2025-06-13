import Phaser from 'phaser';

class Bullet {
    constructor(scene, x, y, angle, playerId, id, damage, speed, lifespan) {
        this.scene = scene;
        this.id = id;
        this.playerId = playerId;
        this.damage = damage;
        this.speed = speed;
        this.lifespan = lifespan;
        this.createdAt = scene.time.now;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, 'bullet');
        this.sprite.setOrigin(0.5);
        this.sprite.setDepth(5);
        
        // Set up physics body
        this.sprite.body.setSize(8, 8);
        
        // Set velocity based on angle
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.sprite.setVelocity(vx, vy);
        
        // Set rotation
        this.sprite.rotation = angle;
        
        // Add trail effect
        this.createTrail();
    }
    
    createTrail() {
        // Create particle emitter for bullet trail
        this.particles = this.scene.add.particles(0, 0, 'bullet', {
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.5, end: 0 },
            tint: 0xffff00,
            speed: 20,
            lifespan: 200,
            blendMode: 'ADD',
            frequency: 10,
            emitZone: {
                source: new Phaser.Geom.Circle(0, 0, 2),
                type: 'edge',
                quantity: 1
            }
        });
        
        // Follow the bullet
        this.particles.startFollow(this.sprite);
    }
    
    update(delta) {
        // Check if bullet has expired
        if (this.scene.time.now - this.createdAt >= this.lifespan) {
            this.destroy();
            return;
        }
        
        // Check if bullet is out of bounds
        const x = this.sprite.x;
        const y = this.sprite.y;
        const bounds = this.scene.physics.world.bounds;
        
        if (x < bounds.x || x > bounds.width || y < bounds.y || y > bounds.height) {
            this.destroy();
        }
    }
    
    destroy() {
        // Remove from bullets map
        this.scene.bullets.delete(this.id);
        
        // Destroy sprite and particles
        if (this.sprite) this.sprite.destroy();
        if (this.particles) this.particles.destroy();
    }
}

export default Bullet;
