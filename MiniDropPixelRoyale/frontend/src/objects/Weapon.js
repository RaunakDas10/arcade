import Phaser from 'phaser';

class Weapon {
    constructor(scene, x, y, type, id) {
        this.scene = scene;
        this.id = id;
        this.type = type;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, `weapon-${type}`);
        this.sprite.setOrigin(0.5);
        this.sprite.setDepth(5);
        
        // Set up physics body
        this.sprite.body.setSize(24, 24);
        
        // Add glow effect
        this.createGlowEffect();
    }
    
    createGlowEffect() {
        // Add pulsing effect to make weapons more visible
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.6, to: 1 },
            scale: { from: 0.9, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Add particles around weapon
        let particleColor;
        
        switch (this.type) {
            case 'pistol':
                particleColor = 0x00ff00;
                break;
            case 'rifle':
                particleColor = 0x0000ff;
                break;
            case 'shotgun':
                particleColor = 0xff0000;
                break;
            default:
                particleColor = 0xffffff;
        }
        
        this.particles = this.scene.add.particles(0, 0, 'bullet', {
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: particleColor,
            speed: 20,
            lifespan: 500,
            blendMode: 'ADD',
            frequency: 50,
            emitZone: {
                source: new Phaser.Geom.Circle(0, 0, 15),
                type: 'edge',
                quantity: 1
            }
        });
        
        // Follow the weapon
        this.particles.startFollow(this.sprite);
    }
    
    destroy() {
        // Destroy sprite and particles
        if (this.sprite) this.sprite.destroy();
        if (this.particles) this.particles.destroy();
    }
}

export default Weapon;
