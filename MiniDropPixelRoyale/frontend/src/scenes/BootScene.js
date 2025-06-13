import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load minimal assets needed for the loading screen
        this.load.image('logo', 'src/assets/images/logo.png');
        this.load.image('loading-background', 'src/assets/images/loading-background.png');
    }

    create() {
        // Set up any global game settings
        this.scale.refresh();
        
        // Initialize any game services or plugins
        
        // Proceed to the preload scene
        this.scene.start('PreloadScene');
    }
}

export default BootScene;
