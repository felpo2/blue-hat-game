export class Moeda extends Phaser.Physics.Arcade.Image {
    constructor(cena, x, y) {
        super(cena, x, y, 'coin_frame_1');

        cena.add.existing(this);
        cena.physics.add.existing(this);

        this.setVelocity(
            Phaser.Math.Between(-80, 80),
            -200
        );
        this.setBounce(0.5);
        this.setCollideWorldBounds(true);
        this.setDrag(80, 0);
        this.setScale(1.5);
        this.setDepth(15);

        this.valor = 1;

        // Animação manual: troca o frame entre moeda 1 e 10
        this._frameAtual = 1;
        this._timerAnim = cena.time.addEvent({
            delay: 80,
            loop: true,
            callback: () => {
                if (!this.active) return;
                this._frameAtual = (this._frameAtual % 10) + 1;
                this.setTexture(`coin_frame_${this._frameAtual}`);
            }
        });
    }

    // Cancela o timer ao destruir  
    destroy(fromScene) {
        if (this._timerAnim) this._timerAnim.remove(false);
        super.destroy(fromScene);
    }
}