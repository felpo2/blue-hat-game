import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x330000);

        // tiramos o click em qualquer lugar
        this.add.text(512, 300, 'A TORRE CAIU!', {
            fontFamily: 'Courier New', 
            fontSize: 64, 
            color: '#ff4444',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // botão de voltar ao inicio
        const btnVoltar = this.add.rectangle(512, 450, 400, 60, 0x550000).setInteractive();
        btnVoltar.setStrokeStyle(4, 0xffffff);

        this.add.text(512, 450, 'VOLTAR AO INÍCIO', {
            fontFamily: 'Courier New',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x880000));
        btnVoltar.on('pointerout', () => btnVoltar.setFillStyle(0x550000));
        btnVoltar.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
