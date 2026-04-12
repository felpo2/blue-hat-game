import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const W = this.scale.width;
        const H = this.scale.height;

        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(W / 2, H * 0.35, 'BLUE HAT\nDELETADO', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#ff4444',
            align: 'center',
            lineSpacing: 20
        }).setOrigin(0.5);

        // Recorde atual para contexto
        const recordeOnda = localStorage.getItem('highscore_onda') || 0;
        this.add.text(W / 2, H * 0.55, `VOCE SOBREVIVEU ATE A\nONDA ${recordeOnda}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // botão de voltar ao inicio
        const btnVoltar = this.add.rectangle(W / 2, H * 0.75, 400, 60, 0x6060c2).setInteractive();
        btnVoltar.setStrokeStyle(4, 0xffffff);

        this.add.text(W / 2, H * 0.75, 'REINICIAR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x7070d2));
        btnVoltar.on('pointerout', () => btnVoltar.setFillStyle(0x6060c2));
        btnVoltar.on('pointerdown', () => {
            this.sound.play('select');
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MainMenu');
            });
        });
    }
}
