export class Inimigo extends Phaser.Physics.Arcade.Image {
    constructor(cena, x, y) {
        super(cena, x, y, 'inimigo'); // textura gerada no GameScene

        cena.add.existing(this);
        cena.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        this.vidaMaxima = 30;
        this.vida = this.vidaMaxima;
        this.danoAoCausarNoPlayer = 10;
        this.recompensa = 1;

        // Mini barra de vida acima do sprite
        this.barraFundo = cena.add.rectangle(x, y - 28, 40, 5, 0x330000).setDepth(50);
        this.barraVida  = cena.add.rectangle(x, y - 28, 40, 5, 0xff4444).setDepth(51);
    }

    receberDano(dano) {
        this.vida -= dano;

        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });

        const proporcao = Math.max(0, this.vida / this.vidaMaxima);
        this.barraVida.width = 40 * proporcao;

        if (this.vida <= 0) {
            this._morrer();
        }
    }

    _morrer() {
        this.scene.droparMoedas(this.x, this.y, this.recompensa);
        this.barraFundo.destroy();
        this.barraVida.destroy();
        this.destroy();
    }

    preUpdate(time, delta) {
        if (this.active) {
            this.barraFundo.setPosition(this.x, this.y - 28);
            this.barraVida.setPosition(
                this.x - (40 - this.barraVida.width) / 2,
                this.y - 28
            );
        }
    }
}