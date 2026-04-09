export class Inimigo extends Phaser.Physics.Arcade.Image {
    constructor(cena, x, y, rodada = 1) {
        super(cena, x, y, 'inimigo'); // textura gerada no GameScene

        cena.add.existing(this);
        cena.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        const forca = rodada;

        this.vidaMaxima = 15 + (forca * 10); 
        this.vida = this.vidaMaxima;
        this.danoAoCausarNoPlayer = 10 + Math.floor(forca * 1.5);
        this.recompensa = 1 + Math.floor(forca / 3);
        this.mortoPorJogador = false;

        // Mini barra de vida acima do sprite
        this.barraFundo = cena.add.rectangle(x, y - 28, 40, 5, 0x330000).setDepth(50);
        this.barraVida  = cena.add.rectangle(x, y - 28, 40, 5, 0xff4444).setDepth(51);
    }

    receberDano(dano, isPlayer = true) {
        this.mortoPorJogador = isPlayer;
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
        if (this.mortoPorJogador && this.scene.eventoMonstroMorto) {
            this.scene.eventoMonstroMorto(10 + (this.recompensa * 2));
        }
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