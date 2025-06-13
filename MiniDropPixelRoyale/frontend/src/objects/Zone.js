import Phaser from 'phaser';
import { distance } from '../utils/helpers';

class Zone {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Zone properties
        this.initialRadius = scene.mapSize / 2;
        this.currentRadius = this.initialRadius;
        this.targetRadius = this.initialRadius;
        this.finalRadius = 100;
        this.shrinkSpeed = 0.1; // Units per millisecond
        this.shrinkDelay = 10000; // Milliseconds between shrinks
        this.shrinkAmount = 0.7; // Multiplier for each shrink
        this.shrinkTime = 0;
        this.nextShrinkTime = 0;
        this.isShrinking = false;
        
        // Create zone graphics
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(1);
        
        // Draw initial zone
        this.drawZone();
        
        // Warning sound
        this.warningSound = scene.sound.add('zone-warning');
    }
    
    startShrinking() {
        // Set next shrink time
        this.nextShrinkTime = this.scene.time.now + this.shrinkDelay;
    }
    
    stopShrinking() {
        this.isShrinking = false;
    }
    
    drawZone() {
        // Clear previous graphics
        this.graphics.clear();
        
        // Draw safe zone (blue circle)
        this.graphics.lineStyle(3, 0x0088ff, 0.8);
        this.graphics.strokeCircle(this.x, this.y, this.currentRadius);
        
        // Draw target zone if shrinking (white dashed circle)
        if (this.isShrinking) {
            this.graphics.lineStyle(2, 0xffffff, 0.5);
            
            // Draw dashed circle
            const segments = 32;
            const angleStep = (Math.PI * 2) / segments;
            
            for (let i = 0; i < segments; i++) {
                if (i % 2 === 0) {
                    const startAngle = i * angleStep;
                    const endAngle = (i + 1) * angleStep;
                    
                    this.graphics.beginPath();
                    this.graphics.arc(this.x, this.y, this.targetRadius, startAngle, endAngle);
                    this.graphics.strokePath();
                }
            }
        }
        
        // Draw danger zone (red gradient)
        const dangerZone = this.scene.add.graphics();
        dangerZone.setDepth(0);
        
        // Create gradient for danger zone
        const gradient = dangerZone.createRadialGradient(
            this.x, this.y, this.currentRadius,
            this.x, this.y, this.scene.mapSize,
            [
                { stop: 0, color: 0xff0000, alpha: 0.1 },
                { stop: 0.3, color: 0xff0000, alpha: 0.3 },
                { stop: 1, color: 0xff0000, alpha: 0.5 }
            ]
        );
        
        // Fill danger zone
        dangerZone.fillStyle(gradient);
        dangerZone.fillRect(0, 0, this.scene.mapSize, this.scene.mapSize);
        
        // Create mask for danger zone
        const mask = this.scene.add.graphics();
        mask.fillStyle(0xffffff);
        mask.fillRect(0, 0, this.scene.mapSize, this.scene.mapSize);
        mask.fillStyle(0x000000);
        mask.fillCircle(this.x, this.y, this.currentRadius);
        
        // Apply mask to danger zone
        const maskObject = mask.createGeometryMask();
        dangerZone.setMask(maskObject);
    }
    
    update(time, delta) {
        // Check if it's time to start shrinking
        if (!this.isShrinking && time >= this.nextShrinkTime) {
            // Calculate new target radius
            this.targetRadius = Math.max(this.finalRadius, this.currentRadius * this.shrinkAmount);
            
            // Start shrinking
            this.isShrinking = true;
            this.shrinkTime = 0;
            
            // Play warning sound
            this.warningSound.play();
        }
        
        // Update shrinking
        if (this.isShrinking) {
            // Update shrink time
            this.shrinkTime += delta;
            
            // Calculate new radius
            const shrinkDuration = (this.currentRadius - this.targetRadius) / this.shrinkSpeed;
            const progress = Math.min(1, this.shrinkTime / shrinkDuration);
            
            this.currentRadius = Phaser.Math.Linear(
                this.currentRadius,
                this.targetRadius,
                progress
            );
            
            // Check if shrinking is complete
            if (progress >= 1) {
                this.isShrinking = false;
                this.currentRadius = this.targetRadius;
                this.nextShrinkTime = time + this.shrinkDelay;
            }
        }
        
        // Redraw zone
        this.drawZone();
    }
    
    isInSafeZone(x, y) {
        return distance(x, y, this.x, this.y) <= this.currentRadius;
    }
}

export default Zone;
