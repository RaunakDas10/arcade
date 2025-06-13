import Phaser from 'phaser';
import { generateGuestName } from '../utils/helpers';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000).setOrigin(0);
        
        // Title
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 4,
            'Mini Drop: Pixel Royale',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // Create a pulsing effect for the title
        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Player name input
        const playerName = generateGuestName();
        
        // Display player name
        const nameText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 20,
            'Your Name:',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        const nameDisplay = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 20,
            playerName,
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffff00',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // Play button
        const playButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            200,
            60,
            0x4CAF50
        ).setInteractive();
        
        const playText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'PLAY',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // Button hover effect
        playButton.on('pointerover', () => {
            playButton.fillColor = 0x66BB6A;
        });
        
        playButton.on('pointerout', () => {
            playButton.fillColor = 0x4CAF50;
        });
        
        // Button click
        playButton.on('pointerdown', () => {
            // Store player name in game data
            this.registry.set('playerName', playerName);
            
            // Start the game
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
        
        // Instructions
        const instructions = [
            'How to Play:',
            '- Move with WASD or Arrow Keys',
            '- Aim and Shoot with Mouse',
            '- Collect weapons and survive!',
            '- Last player standing wins'
        ];
        
        let yPos = this.cameras.main.height / 2 + 180;
        instructions.forEach((line, index) => {
            this.add.text(
                this.cameras.main.width / 2,
                yPos + (index * 30),
                line,
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);
        });
        
        // Play menu music
        this.menuMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
        this.menuMusic.play();
    }
    
    shutdown() {
        if (this.menuMusic) {
            this.menuMusic.stop();
        }
    }
}

export default MenuScene;
