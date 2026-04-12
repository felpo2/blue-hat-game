// Importante: Melhorar o pause, fiquei com preguiça kkkkkkkkk

import { Scene } from 'phaser';

export class PauseMenu extends Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.sound.pauseAll();

        this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0);



        this.add.text(W / 2, H / 2 - 40, 'PAUSADO', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Botão Continuar
        const btnContinuar = this.add.text(W / 2, H / 2, 'RETOMAR JOGO', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            fill: '#44ff44'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnContinuar.on('pointerdown', () => {
            this.sound.play('select');
            this.time.delayedCall(50, () => {
                this.sound.resumeAll();
                this.scene.resume('Game');
                this.scene.stop();
            });
        });
        
        btnContinuar.on('pointerover', () => btnContinuar.setScale(1.1));
        btnContinuar.on('pointerout', () => btnContinuar.setScale(1));

        // Botão Sair - Usando novo Azul #6060c2
        const btnSair = this.add.text(W / 2, H / 2 + 80, 'ABANDONAR PARTIDA', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            fill: '#6060c2'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnSair.on('pointerdown', () => {
            this.sound.play('select');
            this.time.delayedCall(100, () => {
                this.sound.stopAll();
                this.scene.stop('Game');
                this.scene.start('MainMenu');
            });
        });
        
        btnSair.on('pointerover', () => btnSair.setScale(1.1));
        btnSair.on('pointerout', () => btnSair.setScale(1));
    }
}
