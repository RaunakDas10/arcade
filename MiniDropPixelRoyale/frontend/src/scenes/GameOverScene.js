import Phaser from 'phaser';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.isWinner = data.isWinner || false;
    }

    create() {
        // Create semi-transparent overlay
        this.add.rectangle(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setOrigin(0).setScrollFactor(0);
        
        // Game over text
        const mainText = this.isWinner ? 'VICTORY ROYALE!' : 'GAME OVER';
        const mainColor = this.isWinner ? '#ffff00' : '#ff0000';
        
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3,
            mainText,
            {
                fontFamily: 'Arial',
                fontSize: '64px',
                color: mainColor,
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Result text
        const resultText = this.isWinner
            ? 'You are the last one standing!'
            : 'Better luck next time!';
        
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            resultText,
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Create play again button
        const playAgainButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height * 2/3,
            200,
            60,
            0x4CAF50
        ).setInteractive().setScrollFactor(0);
        
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 2/3,
            'PLAY AGAIN',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Create menu button
        const menuButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height * 2/3 + 80,
            200,
            60,
            0x2196F3
        ).setInteractive().setScrollFactor(0);
        
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 2/3 + 80,
            'MAIN MENU',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Button hover effects
        playAgainButton.on('pointerover', () => {
            playAgainButton.fillColor = 0x66BB6A;
        });
        
        playAgainButton.on('pointerout', () => {
            playAgainButton.fillColor = 0x4CAF50;
        });
        
        menuButton.on('pointerover', () => {
            menuButton.fillColor = 0x42A5F5;
        });
        
        menuButton.on('pointerout', () => {
            menuButton.fillColor = 0x2196F3;
        });
        
        // Button click handlers
        playAgainButton.on('pointerdown', () => {
            // Restart game
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop();
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
        
        menuButton.on('pointerdown', () => {
            // Return to main menu
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop();
            this.scene.start('MenuScene');
        });
        
        // Play victory or defeat sound
        if (this.isWinner) {
            // Victory sound
            this.sound.play('pickup', { volume: 1.5 });
        } else {
            // Defeat sound
            this.sound.play('hit', { volume: 1.5 });
        }
    }
}

export default GameOverScene;
