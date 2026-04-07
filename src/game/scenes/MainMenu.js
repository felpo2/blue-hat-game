import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
    
        this.add.text(512, 200, 'TOWER\nDEFENSE', {
            fontFamily: 'Courier New',
            fontSize: '80px',
            color: '#fca311',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Botão JOGAR
        const btnJogar = this.add.rectangle(512, 400, 300, 60, 0x2244ff).setInteractive();
        btnJogar.setStrokeStyle(4, 0xffffff);

        const txtJogar = this.add.text(512, 400, 'JOGAR', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        btnJogar.on('pointerover', () => btnJogar.setFillStyle(0x4466ff));
        btnJogar.on('pointerout', () => btnJogar.setFillStyle(0x2244ff));
        btnJogar.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
