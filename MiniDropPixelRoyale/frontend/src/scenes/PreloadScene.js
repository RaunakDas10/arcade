import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Update the loading bar as assets are loaded
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
        
        // Load game assets
        this.loadAssets();
    }

    loadAssets() {
        // Player sprites
        this.load.image('player-blue', 'src/assets/images/player-blue.png');
        this.load.image('player-red', 'src/assets/images/player-red.png');
        this.load.image('player-green', 'src/assets/images/player-green.png');
        this.load.image('player-yellow', 'src/assets/images/player-yellow.png');
        
        // Weapons and projectiles
        this.load.image('bullet', 'src/assets/images/bullet.png');
        this.load.image('weapon-pistol', 'src/assets/images/weapon-pistol.png');
        this.load.image('weapon-rifle', 'src/assets/images/weapon-rifle.png');
        this.load.image('weapon-shotgun', 'src/assets/images/weapon-shotgun.png');
        
        // Environment
        this.load.image('tileset', 'src/assets/images/tileset.png');
        this.load.image('zone-border', 'src/assets/images/zone-border.png');
        
        // UI elements
        this.load.image('button', 'src/assets/images/button.png');
        this.load.image('health-bar', 'src/assets/images/health-bar.png');
        this.load.image('joystick', 'src/assets/images/joystick.png');
        this.load.image('joystick-base', 'src/assets/images/joystick-base.png');
        
        // Audio
        this.load.audio('shoot', 'src/assets/audio/shoot.mp3');
        this.load.audio('hit', 'src/assets/audio/hit.mp3');
        this.load.audio('pickup', 'src/assets/audio/pickup.mp3');
        this.load.audio('zone-warning', 'src/assets/audio/zone-warning.mp3');
        this.load.audio('game-music', 'src/assets/audio/game-music.mp3');
        this.load.audio('menu-music', 'src/assets/audio/menu-music.mp3');
    }

    create() {
        // Proceed to the menu scene
        this.scene.start('MenuScene');
    }
}

export default PreloadScene;
